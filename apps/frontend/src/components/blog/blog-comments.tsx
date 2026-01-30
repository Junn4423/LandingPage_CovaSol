'use client';

import { useEffect, useState, useRef } from 'react';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  avatar?: string;
  replies?: Comment[];
}

interface BlogCommentsProps {
  blogId?: string;
  slug: string;
}

export function BlogComments({ blogId, slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchComments();
  }, [blogId, slug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tên và nội dung bình luận.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blogId,
          name: name.trim(),
          email: email.trim(),
          content: content.trim()
        })
      });

      if (response.ok) {
        setSuccess('Bình luận của bạn đã được gửi và đang chờ duyệt.');
        setName('');
        setEmail('');
        setContent('');
        formRef.current?.reset();
      } else {
        const data = await response.json();
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Không thể gửi bình luận. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
      '#ec4899', '#f43f5e'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <section className="blog-comments">
      <h3 className="comments-title">
        <i className="far fa-comments" aria-hidden="true" />
        Bình luận ({comments.length})
      </h3>

      {/* Comment Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="comment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="comment-name">Họ tên *</label>
            <input
              type="text"
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ tên của bạn"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment-email">Email (không bắt buộc)</label>
            <input
              type="email"
              id="comment-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="comment-content">Nội dung bình luận *</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>
        
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true" />
              Đang gửi...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane" aria-hidden="true" />
              Gửi bình luận
            </>
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {isLoading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin" aria-hidden="true" />
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <i className="far fa-comment-dots" aria-hidden="true" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment-item">
              <div 
                className="comment-avatar"
                style={{ backgroundColor: getAvatarColor(comment.name) }}
              >
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.name} />
                ) : (
                  <span>{getInitials(comment.name)}</span>
                )}
              </div>
              <div className="comment-body">
                <header className="comment-header">
                  <span className="comment-author">{comment.name}</span>
                  <time className="comment-date">{formatDate(comment.createdAt)}</time>
                </header>
                <div className="comment-content">{comment.content}</div>
              </div>
            </article>
          ))
        )}
      </div>

      <style jsx>{`
        .blog-comments {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }

        .comments-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 24px;
        }

        .comment-form {
          background: #f9fafb;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #124e66;
          box-shadow: 0 0 0 3px rgba(18, 78, 102, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .form-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .form-success {
          background: #f0fdf4;
          color: #16a34a;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #124e66;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #0d3d51;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }

        .comment-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .comment-avatar {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          overflow: hidden;
        }

        .comment-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .comment-body {
          flex: 1;
          min-width: 0;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .comment-author {
          font-weight: 600;
          color: #1f2937;
        }

        .comment-date {
          font-size: 13px;
          color: #9ca3af;
        }

        .comment-content {
          color: #4b5563;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .comment-item {
            padding: 16px;
          }

          .comment-avatar {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
