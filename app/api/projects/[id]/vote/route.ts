import { NextResponse } from 'next/server';
import { addVote, getProject } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const project = await getProject(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json();
  const fields = ['generalUsefulness', 'usefulnessToYearn', 'creativity', 'executionClarity'] as const;

  for (const field of fields) {
    const val = body[field];
    if (typeof val !== 'number' || val < 1 || val > 10 || !Number.isInteger(val)) {
      return NextResponse.json(
        { error: `${field} must be an integer between 1 and 10` },
        { status: 400 }
      );
    }
  }

  const vote = await addVote(params.id, {
    generalUsefulness: body.generalUsefulness,
    usefulnessToYearn: body.usefulnessToYearn,
    creativity: body.creativity,
    executionClarity: body.executionClarity,
  });

  return NextResponse.json(vote, { status: 201 });
}
