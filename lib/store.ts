import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

export interface Vote {
  id: string;
  generalUsefulness: number;
  usefulnessToYearn: number;
  creativity: number;
  executionClarity: number;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: number;
  votes: Vote[];
}

type ProjectMeta = Omit<Project, 'votes'>;

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function getProjects(limit = 10): Promise<Project[]> {
  const ids: string[] =
    limit === 0
      ? await redis.zrange('projects', 0, -1, { rev: true })
      : await redis.zrange('projects', 0, limit - 1, { rev: true });

  if (ids.length === 0) return [];

  const metas = await redis.mget<(ProjectMeta | null)[]>(
    ...ids.map((id) => `project:${id}`)
  );

  const projects: Project[] = [];
  for (let i = 0; i < ids.length; i++) {
    const meta = metas[i];
    if (!meta) continue;
    const votes = await redis.lrange<Vote>(`votes:${ids[i]}`, 0, -1);
    projects.push({ ...meta, votes });
  }

  return projects;
}

export async function getProject(id: string): Promise<Project | undefined> {
  const meta = await redis.get<ProjectMeta>(`project:${id}`);
  if (!meta) return undefined;
  const votes = await redis.lrange<Vote>(`votes:${id}`, 0, -1);
  return { ...meta, votes };
}

export async function createProject(data: {
  name: string;
  description?: string;
  imageUrl?: string;
}): Promise<Project> {
  const id = nanoid(10);
  const createdAt = Date.now();
  const meta: ProjectMeta = {
    id,
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl,
    createdAt,
  };

  await redis.set(`project:${id}`, meta);
  await redis.zadd('projects', { score: createdAt, member: id });

  return { ...meta, votes: [] };
}

export async function addVote(
  projectId: string,
  scores: {
    generalUsefulness: number;
    usefulnessToYearn: number;
    creativity: number;
    executionClarity: number;
  }
): Promise<Vote | null> {
  const meta = await redis.get<ProjectMeta>(`project:${projectId}`);
  if (!meta) return null;

  const vote: Vote = {
    id: nanoid(10),
    ...scores,
    createdAt: Date.now(),
  };

  await redis.rpush(`votes:${projectId}`, vote);
  return vote;
}

export function getVoteAverages(project: Pick<Project, 'votes'>) {
  const { votes } = project;
  if (votes.length === 0) {
    return {
      generalUsefulness: 0,
      usefulnessToYearn: 0,
      creativity: 0,
      executionClarity: 0,
      overall: 0,
      count: 0,
    };
  }

  const sum = votes.reduce(
    (acc, v) => ({
      generalUsefulness: acc.generalUsefulness + v.generalUsefulness,
      usefulnessToYearn: acc.usefulnessToYearn + v.usefulnessToYearn,
      creativity: acc.creativity + v.creativity,
      executionClarity: acc.executionClarity + v.executionClarity,
    }),
    { generalUsefulness: 0, usefulnessToYearn: 0, creativity: 0, executionClarity: 0 }
  );

  const count = votes.length;
  const avg = {
    generalUsefulness: sum.generalUsefulness / count,
    usefulnessToYearn: sum.usefulnessToYearn / count,
    creativity: sum.creativity / count,
    executionClarity: sum.executionClarity / count,
  };

  return {
    ...avg,
    overall: (avg.generalUsefulness + avg.usefulnessToYearn + avg.creativity + avg.executionClarity) / 4,
    count,
  };
}
