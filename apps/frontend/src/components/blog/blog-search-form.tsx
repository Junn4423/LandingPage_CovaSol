'use client';

interface BlogSearchFormProps {
  defaultQuery?: string;
}

export function BlogSearchForm({ defaultQuery }: BlogSearchFormProps) {
  return (
    <form action="/blog" method="GET" className="blog-search-form" data-aos="fade-up" data-aos-delay="200">
      <input 
        type="search" 
        name="q" 
        placeholder="Tìm kiếm bài viết..." 
        defaultValue={defaultQuery || ''}
        aria-label="Tìm kiếm bài viết"
      />
      <button type="submit">
        <i className="fas fa-search" aria-hidden="true" />
        Tìm kiếm
      </button>
      
      <style jsx>{`
        .blog-search-form {
          display: flex;
          gap: 12px;
          max-width: 500px;
          margin: 24px auto 0;
        }
        
        .blog-search-form input {
          flex: 1;
          padding: 14px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 15px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .blog-search-form input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .blog-search-form input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .blog-search-form button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: white;
          color: #124e66;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .blog-search-form button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        @media (max-width: 480px) {
          .blog-search-form {
            flex-direction: column;
          }
          
          .blog-search-form button {
            justify-content: center;
          }
        }
      `}</style>
    </form>
  );
}
