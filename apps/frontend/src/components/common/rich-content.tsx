'use client';

import { useEffect, useRef } from 'react';

interface RichContentProps {
  content: string;
  className?: string;
}

/**
 * Component hiển thị nội dung rich text từ CKEditor
 * Bao gồm các styles để render đúng format đã lưu
 */
export function RichContent({ content, className = '' }: RichContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle external links and add security attributes
  useEffect(() => {
    if (!containerRef.current) return;

    const links = containerRef.current.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // External link - add security attributes
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
        }
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Make images responsive
    const images = containerRef.current.querySelectorAll('img');
    images.forEach(img => {
      if (!img.classList.contains('rich-content-processed')) {
        img.classList.add('rich-content-processed');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
    });

    // Handle iframes for responsive embeds
    const iframes = containerRef.current.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const parent = iframe.parentElement;
      if (parent && !parent.classList.contains('responsive-embed')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'responsive-embed';
        wrapper.style.position = 'relative';
        wrapper.style.paddingBottom = '56.25%';
        wrapper.style.height = '0';
        wrapper.style.overflow = 'hidden';
        wrapper.style.maxWidth = '100%';
        
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        
        parent.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      }
    });
  }, [content]);

  return (
    <>
      <style jsx global>{`
        .rich-content {
          font-family: 'Open Sans', 'Roboto', system-ui, -apple-system, sans-serif;
          line-height: 1.8;
          color: #1f2937;
          font-size: 1.0625rem;
        }
        
        /* Headings */
        .rich-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
          line-height: 1.3;
        }
        .rich-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          color: #111827;
          line-height: 1.35;
        }
        .rich-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
          line-height: 1.4;
        }
        .rich-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          color: #111827;
          line-height: 1.4;
        }
        .rich-content h5 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        .rich-content h6 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        /* Paragraphs */
        .rich-content p {
          margin-bottom: 1.25rem;
        }
        .rich-content p:last-child {
          margin-bottom: 0;
        }
        
        /* Links */
        .rich-content a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .rich-content a:hover {
          color: #1d4ed8;
        }
        
        /* Lists - QUAN TRỌNG cho numbered/bulleted lists */
        .rich-content ul,
        .rich-content ol {
          margin: 1rem 0 1.25rem;
          padding-left: 2rem;
        }
        .rich-content ul {
          list-style-type: disc !important;
        }
        .rich-content ol {
          list-style-type: decimal !important;
        }
        .rich-content li {
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
          display: list-item !important;
        }
        .rich-content li > p {
          margin-bottom: 0.25rem;
        }
        .rich-content li > ul,
        .rich-content li > ol {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        /* Nested list styles */
        .rich-content ul ul {
          list-style-type: circle !important;
        }
        .rich-content ul ul ul {
          list-style-type: square !important;
        }
        .rich-content ol ol {
          list-style-type: lower-alpha !important;
        }
        .rich-content ol ol ol {
          list-style-type: lower-roman !important;
        }
        
        /* Todo List */
        .rich-content .todo-list {
          list-style: none;
          padding-left: 0;
        }
        .rich-content .todo-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .rich-content .todo-list input[type="checkbox"] {
          margin-top: 0.35rem;
          width: 1rem;
          height: 1rem;
          cursor: default;
        }
        
        /* Blockquote */
        .rich-content blockquote {
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background-color: #f8fafc;
          font-style: italic;
          color: #475569;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .rich-content blockquote p {
          margin-bottom: 0;
        }
        .rich-content blockquote p + p {
          margin-top: 0.75rem;
        }
        
        /* Images */
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .rich-content figure {
          margin: 1.5rem 0;
        }
        .rich-content figure.image {
          text-align: center;
        }
        .rich-content figure.image-style-side {
          float: right;
          margin-left: 1.5rem;
          margin-right: 0;
          max-width: 50%;
        }
        .rich-content figcaption {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
          margin-top: 0.5rem;
          font-style: italic;
        }
        
        /* Tables */
        .rich-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9375rem;
        }
        .rich-content table th,
        .rich-content table td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          text-align: left;
        }
        .rich-content table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #111827;
        }
        .rich-content table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .rich-content table caption {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-align: left;
          font-style: italic;
        }
        
        /* Code */
        .rich-content code {
          background-color: #f1f5f9;
          color: #e11d48;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 0.875em;
        }
        .rich-content pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .rich-content pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: inherit;
        }
        
        /* Horizontal Rule */
        .rich-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        /* Highlight markers */
        .rich-content .marker-yellow,
        .rich-content mark.marker-yellow {
          background-color: #fef9c3;
          padding: 0.125rem 0.25rem;
        }
        .rich-content .marker-green,
        .rich-content mark.marker-green {
          background-color: #dcfce7;
          padding: 0.125rem 0.25rem;
        }
        .rich-content .marker-pink,
        .rich-content mark.marker-pink {
          background-color: #fce7f3;
          padding: 0.125rem 0.25rem;
        }
        .rich-content .marker-blue,
        .rich-content mark.marker-blue {
          background-color: #dbeafe;
          padding: 0.125rem 0.25rem;
        }
        .rich-content .pen-red {
          color: #dc2626;
        }
        .rich-content .pen-green {
          color: #16a34a;
        }
        
        /* Text styles */
        .rich-content strong,
        .rich-content b {
          font-weight: 700;
        }
        .rich-content em,
        .rich-content i {
          font-style: italic;
        }
        .rich-content u {
          text-decoration: underline;
        }
        .rich-content s,
        .rich-content del {
          text-decoration: line-through;
        }
        .rich-content sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        .rich-content sup {
          vertical-align: super;
          font-size: 0.75em;
        }
        
        /* Text alignment */
        .rich-content .text-left,
        .rich-content [style*="text-align: left"],
        .rich-content [style*="text-align:left"] {
          text-align: left;
        }
        .rich-content .text-center,
        .rich-content [style*="text-align: center"],
        .rich-content [style*="text-align:center"] {
          text-align: center;
        }
        .rich-content .text-right,
        .rich-content [style*="text-align: right"],
        .rich-content [style*="text-align:right"] {
          text-align: right;
        }
        .rich-content .text-justify,
        .rich-content [style*="text-align: justify"],
        .rich-content [style*="text-align:justify"] {
          text-align: justify;
        }
        
        /* Media embed */
        .rich-content .media,
        .rich-content .ck-media__wrapper {
          margin: 1.5rem 0;
        }
        .rich-content .responsive-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .rich-content .responsive-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
        }
        
        /* HTML embed */
        .rich-content .raw-html-embed {
          margin: 1.5rem 0;
        }
        
        /* Image resizing */
        .rich-content .image-style-align-left {
          float: left;
          margin-right: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-content .image-style-align-right {
          float: right;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-content .image_resized {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Clear floats */
        .rich-content::after {
          content: '';
          display: table;
          clear: both;
        }
        
        /* First element margin fix */
        .rich-content > *:first-child {
          margin-top: 0;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .rich-content.dark-mode {
            color: #e5e7eb;
          }
          .rich-content.dark-mode h1,
          .rich-content.dark-mode h2,
          .rich-content.dark-mode h3,
          .rich-content.dark-mode h4,
          .rich-content.dark-mode h5,
          .rich-content.dark-mode h6 {
            color: #f9fafb;
          }
          .rich-content.dark-mode a {
            color: #60a5fa;
          }
          .rich-content.dark-mode a:hover {
            color: #93c5fd;
          }
          .rich-content.dark-mode blockquote {
            background-color: #1f2937;
            color: #9ca3af;
          }
          .rich-content.dark-mode code {
            background-color: #374151;
            color: #f87171;
          }
          .rich-content.dark-mode table th {
            background-color: #374151;
            color: #f9fafb;
          }
          .rich-content.dark-mode table tr:nth-child(even) {
            background-color: #1f2937;
          }
          .rich-content.dark-mode table th,
          .rich-content.dark-mode table td {
            border-color: #4b5563;
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}

export default RichContent;
