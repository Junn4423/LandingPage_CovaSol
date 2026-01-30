'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface ViewCounterProps {
  blogId?: string;
  slug: string;
  className?: string;
}

export function ViewCounter({ blogId, slug, className = '' }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!blogId) {
      setIsLoading(false);
      return;
    }
    
    const trackView = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/blog/${slug}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ blogId })
        });

        if (response.ok) {
          const data = await response.json();
          setViewCount(data.viewCount);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackView();
  }, [blogId, slug]);

  if (isLoading) {
    return (
      <span className={`view-counter ${className}`}>
        <i className="far fa-eye" aria-hidden="true" />
        <span>...</span>
      </span>
    );
  }

  if (viewCount === null) {
    return null;
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <span className={`view-counter ${className}`}>
      <i className="far fa-eye" aria-hidden="true" />
      <span>{formatViewCount(viewCount)} lượt xem</span>
      
      <style jsx>{`
        .view-counter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }

        .view-counter i {
          font-size: 12px;
        }
      `}</style>
    </span>
  );
}
