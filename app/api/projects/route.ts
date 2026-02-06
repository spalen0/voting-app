import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject, getVoteAverages } from '@/lib/store';

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get('all') === 'true';
  const projects = getProjects(all ? 0 : 10);
  const result = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    averages: getVoteAverages(p),
  }));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const project = createProject({
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    imageUrl: body.imageUrl || undefined,
  });

  return NextResponse.json(project, { status: 201 });
}
