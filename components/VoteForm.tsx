'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteFormProps {
  projectId: string;
  onVoted: () => void;
}

const criteria = [
  { key: 'generalUsefulness', label: 'General Usefulness' },
  { key: 'usefulnessToYearn', label: 'Usefulness to Yearn' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'executionClarity', label: 'Execution + Clarity' },
] as const;

export default function VoteForm({ projectId, onVoted }: VoteFormProps) {
  const router = useRouter();
  const [scores, setScores] = useState({
    generalUsefulness: 5,
    usefulnessToYearn: 5,
    creativity: 5,
    executionClarity: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scores),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit vote');
      }

      onVoted();
      router.push('/leaderboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {criteria.map(({ key, label }) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-neutral-300">{label}</label>
            <span className="text-sm font-bold text-yearn w-8 text-right">{scores[key]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) => setScores((s) => ({ ...s, [key]: parseInt(e.target.value) }))}
            className="w-full accent-yearn"
          />
          <div className="flex justify-between text-xs text-neutral-600">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">Vote submitted!</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-yearn text-white rounded font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Vote'}
      </button>
    </form>
  );
}
