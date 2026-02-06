'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VoteForm from '@/components/VoteForm';

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  averages: {
    generalUsefulness: number;
    usefulnessToYearn: number;
    creativity: number;
    executionClarity: number;
    overall: number;
    count: number;
  };
}

const criteriaLabels: Record<string, string> = {
  generalUsefulness: 'General Usefulness',
  usefulnessToYearn: 'Usefulness to Yearn',
  creativity: 'Creativity',
  executionClarity: 'Execution + Clarity',
};

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const projects = await res.json();
      const found = projects.find((p: ProjectDetail) => p.id === id);
      if (found) {
        setProject(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Project not found</h1>
          <Link href="/" className="text-yearn hover:underline">Back to projects</Link>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </main>
    );
  }

  const { averages } = project;

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-yearn hover:underline">&larr; Back to projects</Link>
            <Link href="/leaderboard" className="text-sm text-yearn hover:underline">Leaderboard</Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          {project.imageUrl && (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full max-h-64 object-cover rounded-lg mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-neutral-400">{project.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
            {averages.count === 0 ? (
              <p className="text-neutral-500">No votes yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(criteriaLabels).map(([key, label]) => {
                  const val = averages[key as keyof typeof averages] as number;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-400">{label}</span>
                        <span className="text-white font-medium">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yearn rounded-full transition-all"
                          style={{ width: `${(val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-neutral-800 flex justify-between">
                  <span className="text-neutral-300 font-medium">Overall Average</span>
                  <span className="text-yearn font-bold text-lg">{averages.overall.toFixed(1)}</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Based on {averages.count} vote{averages.count !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Cast Your Vote</h2>
            <VoteForm projectId={id} onVoted={fetchProject} />
          </div>
        </div>
      </div>
    </main>
  );
}
