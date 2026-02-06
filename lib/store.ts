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

const globalForStore = globalThis as unknown as { __projects: Project[] };
if (!globalForStore.__projects) {
  globalForStore.__projects = [];
}
const projects = globalForStore.__projects;

export function getProjects(limit = 10): Project[] {
  const sorted = [...projects].sort((a, b) => b.createdAt - a.createdAt);
  return limit === 0 ? sorted : sorted.slice(0, limit);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function createProject(data: {
  name: string;
  description?: string;
  imageUrl?: string;
}): Project {
  const project: Project = {
    id: nanoid(10),
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl,
    createdAt: Date.now(),
    votes: [],
  };
  projects.push(project);
  return project;
}

export function addVote(
  projectId: string,
  scores: {
    generalUsefulness: number;
    usefulnessToYearn: number;
    creativity: number;
    executionClarity: number;
  }
): Vote | null {
  const project = getProject(projectId);
  if (!project) return null;

  const vote: Vote = {
    id: nanoid(10),
    ...scores,
    createdAt: Date.now(),
  };
  project.votes.push(vote);
  return vote;
}

export function getVoteAverages(project: Project) {
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
