'use client';

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-content">
        <div className="offline-icon">
          <i className="fas fa-wifi" aria-hidden="true" />
          <span className="offline-slash">/</span>
        </div>
        <h1>Không có kết nối mạng</h1>
        <p>
          Bạn đang offline. Vui lòng kiểm tra kết nối internet và thử lại.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          <i className="fas fa-redo" aria-hidden="true" />
          Thử lại
        </button>
      </div>

      <style jsx>{`
        .offline-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          padding: 20px;
        }

        .offline-content {
          text-align: center;
          max-width: 400px;
        }

        .offline-icon {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 32px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #9ca3af;
        }

        .offline-slash {
          position: absolute;
          font-size: 80px;
          font-weight: 100;
          color: #ef4444;
          transform: rotate(15deg);
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }

        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: #124e66;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-btn:hover {
          background: #0d3d51;
        }
      `}</style>
    </div>
  );
}
