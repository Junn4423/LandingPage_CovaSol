'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReviewSummary, ReviewStats } from '@/lib/api/reviews';

interface ReviewsCarouselProps {
  reviews: ReviewSummary[];
  stats: ReviewStats;
}

// Lấy chữ cái đầu của tên (lấy chữ cuối trong tên Việt Nam)
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  // Lấy chữ cái đầu của từ cuối cùng (tên trong tiếng Việt)
  return words[words.length - 1].charAt(0).toUpperCase();
}

// Tính thời gian tương đối
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần trước`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} năm trước`;
  }
}

// Render star icon class
function getStarClass(rating: number, position: number): string {
  if (rating >= position) {
    return 'fas fa-star';
  }
  if (rating >= position - 0.5) {
    return 'fas fa-star-half-alt';
  }
  return 'far fa-star';
}

export function ReviewsCarousel({ reviews, stats }: ReviewsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / cardsPerPage);

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (isHovered || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, 3000);
    return () => clearInterval(interval);
  }, [totalPages, isHovered]);

  // Scroll to current page
  useEffect(() => {
    const viewport = carouselRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const firstCard = track.querySelector<HTMLElement>('.review-card');
    const cardWidth = firstCard?.clientWidth ?? 400;
    const styles = getComputedStyle(track);
    const gapValue = styles.getPropertyValue('column-gap') || styles.getPropertyValue('gap') || '32';
    const gap = parseFloat(gapValue) || 32;

    viewport.scrollTo({
      left: currentPage * (cardWidth + gap) * cardsPerPage,
      behavior: 'smooth'
    });
  }, [currentPage, cardsPerPage]);

  const handlePrev = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <i className="fas fa-comments" />
        <p>Chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <>
      <div 
        className="reviews-carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="reviews-carousel" ref={carouselRef}>
          <div className="reviews-track" ref={trackRef}>
            {reviews.map((review, index) => (
              <div
                className="review-card"
                data-aos="fade-up"
                key={review.id}
              >
                <div className="review-header">
                  <div className="reviewer-info">
                    <div
                      className="reviewer-avatar"
                      style={{
                        backgroundColor: review.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px'
                      }}
                    >
                      {getInitials(review.name)}
                    </div>
                    <div className="reviewer-details">
                      <h4>{review.name}</h4>
                      <span>{review.role}</span>
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(position => (
                      <i className={getStarClass(review.rating, position)} key={position} />
                    ))}
                  </div>
                  <span className="rating-number">{review.rating.toFixed(1)}</span>
                </div>
                <p className="review-text">{review.quote}</p>
                <div className="review-date">{getRelativeTime(review.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
        <button
          className="carousel-nav carousel-prev"
          aria-label="Previous reviews"
          onClick={handlePrev}
        >
          <i className="fas fa-chevron-left" />
        </button>
        <button
          className="carousel-nav carousel-next"
          aria-label="Next reviews"
          onClick={handleNext}
        >
          <i className="fas fa-chevron-right" />
        </button>
        <div className="carousel-indicators">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`carousel-indicator ${i === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="reviews-summary" data-aos="fade-up">
        <div className="summary-stats">
          <div className="overall-rating">
            <span className="rating-number">{stats.averageRating.toFixed(1)}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(position => (
                <i className={getStarClass(stats.averageRating, position)} key={position} />
              ))}
            </div>
            <span className="total-reviews">{stats.totalReviews} đánh giá</span>
          </div>
          <div className="rating-breakdown">
            {stats.ratingBreakdown.map(item => (
              <div className="rating-bar" key={item.label}>
                <span>{item.label}</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${item.percent}%` }} />
                </div>
                <span>{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
