'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = [];
  // Match h2 and h3 headings
  const regex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const existingId = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    
    if (text) {
      // Generate ID from text if not present
      const id = existingId || text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
      
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);

    // Add IDs to headings in the DOM
    const articleBody = document.querySelector('.article-body');
    if (articleBody) {
      const domHeadings = articleBody.querySelectorAll('h2, h3');
      domHeadings.forEach((heading, index) => {
        if (extracted[index] && !heading.id) {
          heading.id = extracted[index].id;
        }
      });
    }
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length < 3) {
    return null; // Don't show TOC for short articles
  }

  return (
    <nav className={`table-of-contents ${className}`} aria-label="Mục lục">
      <button 
        className="toc-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span>
          <i className="fas fa-list-ul" aria-hidden="true" /> Mục lục
        </span>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} aria-hidden="true" />
      </button>
      
      {isExpanded && (
        <ol className="toc-list">
          {headings.map((heading, index) => (
            <li 
              key={index} 
              className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
            >
              <button onClick={() => handleClick(heading.id)}>
                {heading.text}
              </button>
            </li>
          ))}
        </ol>
      )}

      <style jsx>{`
        .table-of-contents {
          background: #f8fafc;
          border-radius: 12px;
          padding: 0;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .toc-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: #1e293b;
          font-size: 16px;
        }

        .toc-header span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toc-header:hover {
          background: #f1f5f9;
        }

        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0 20px 16px;
          counter-reset: toc-counter;
        }

        .toc-item {
          margin: 0;
          padding: 0;
        }

        .toc-item button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          color: #475569;
          background: none;
          border: none;
          border-left: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          line-height: 1.5;
          transition: all 0.2s;
        }

        .toc-item button:hover {
          color: #124e66;
          background: #f1f5f9;
        }

        .toc-item.active button {
          color: #124e66;
          border-left-color: #124e66;
          background: #e0f2fe;
          font-weight: 500;
        }

        .toc-level-3 button {
          padding-left: 28px;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .table-of-contents {
            position: relative;
          }
        }
      `}</style>
    </nav>
  );
}
