import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  averages: {
    overall: number;
    count: number;
  };
}

export default function ProjectCard({ id, name, description, imageUrl, averages }: ProjectCardProps) {
  return (
    <Link href={`/project/${id}`}>
      <div className="border border-neutral-800 rounded-lg p-4 hover:border-yearn transition-colors bg-neutral-900 h-full flex flex-col">
        {imageUrl && (
          <div className="w-full h-40 mb-3 rounded overflow-hidden bg-neutral-800">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-neutral-400 mb-3 line-clamp-2 flex-1">{description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-800">
          <span className="text-sm text-neutral-400">
            {averages.count} vote{averages.count !== 1 ? 's' : ''}
          </span>
          {averages.count > 0 && (
            <span className="text-sm font-medium text-yearn">
              {averages.overall.toFixed(1)} avg
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
