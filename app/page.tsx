'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  averages: { overall: number; count: number };
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-yearn">Yearn</span> Hackathon Voting
            </h1>
            <p className="text-sm text-neutral-400 mt-1">Rate projects across 4 criteria</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-sm text-yearn hover:underline">
              Leaderboard
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-yearn text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              + Create Project
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-neutral-500 text-center py-12">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No projects yet. Be the first to add one!</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-yearn text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                imageUrl={p.imageUrl}
                averages={p.averages}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchProjects}
      />
    </main>
  );
}
