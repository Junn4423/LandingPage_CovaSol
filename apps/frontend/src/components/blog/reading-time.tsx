interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

// Average reading speed: 200-250 words per minute for Vietnamese
const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: string): number {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Count words (works for both Vietnamese and English)
  const wordCount = text.trim().split(/\s+/).length;
  // Calculate reading time in minutes, minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function ReadingTime({ minutes, className = '' }: ReadingTimeProps) {
  return (
    <span 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#6b7280',
        fontSize: '14px'
      }}
    >
      <i className="far fa-clock" aria-hidden="true" style={{ fontSize: '12px' }} />
      <span>{minutes} phút đọc</span>
    </span>
  );
}
