'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProjectData {
  id: string;
  name: string;
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
  generalUsefulness: 'General',
  usefulnessToYearn: 'Yearn',
  creativity: 'Creativity',
  executionClarity: 'Execution',
};

function rankStyle(position: number): string {
  if (position === 1) return 'text-yellow-400';
  if (position === 2) return 'text-neutral-300';
  if (position === 3) return 'text-amber-600';
  return 'text-neutral-500';
}

function rankBorder(position: number): string {
  if (position === 1) return 'border-l-2 border-yellow-400';
  if (position === 2) return 'border-l-2 border-neutral-300';
  if (position === 3) return 'border-l-2 border-amber-600';
  return '';
}

export default function LeaderboardPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects?all=true')
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a: ProjectData, b: ProjectData) => {
          if (a.averages.count === 0 && b.averages.count === 0) return 0;
          if (a.averages.count === 0) return 1;
          if (b.averages.count === 0) return -1;
          return b.averages.overall - a.averages.overall;
        });
        setProjects(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-neutral-400 mt-1">Projects ranked by overall average score</p>
          </div>
          <Link href="/" className="text-sm text-yearn hover:underline">
            &larr; Back to projects
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-neutral-500 text-center py-12">Loading leaderboard...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No projects yet. Create some to see the leaderboard!</p>
            <Link
              href="/"
              className="px-4 py-2 bg-yearn text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              Go to Projects
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-left">
                  <th className="py-3 px-3 w-12">#</th>
                  <th className="py-3 px-3">Project</th>
                  {Object.values(criteriaLabels).map((label) => (
                    <th key={label} className="py-3 px-3 text-center hidden sm:table-cell">{label}</th>
                  ))}
                  <th className="py-3 px-3 text-center">Overall</th>
                  <th className="py-3 px-3 text-center">Votes</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const pos = i + 1;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 ${rankBorder(pos)}`}
                    >
                      <td className={`py-3 px-3 font-bold ${rankStyle(pos)}`}>
                        {pos}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/project/${p.id}`}
                          className="text-white hover:text-yearn transition-colors font-medium"
                        >
                          {p.name}
                        </Link>
                      </td>
                      {Object.keys(criteriaLabels).map((key) => (
                        <td key={key} className="py-3 px-3 text-center text-neutral-400 hidden sm:table-cell">
                          {p.averages.count > 0
                            ? (p.averages[key as keyof typeof p.averages] as number).toFixed(1)
                            : '-'}
                        </td>
                      ))}
                      <td className="py-3 px-3 text-center font-bold text-yearn">
                        {p.averages.count > 0 ? p.averages.overall.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-500">
                        {p.averages.count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
