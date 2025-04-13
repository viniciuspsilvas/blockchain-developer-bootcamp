import { FC } from 'react';

interface LoadingProps {
  className?: string;
}

export const Loading: FC<LoadingProps> = ({ className = '' }) => {
  return (
    <div className={`bg-secondary rounded-md p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}; 