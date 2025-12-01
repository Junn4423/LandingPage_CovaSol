/**
 * Reviews Carousel
 * Handles auto-sliding carousel for customer reviews (3 reviews at a time)
 */

class ReviewsCarousel {
  constructor() {
    this.currentSlide = 0;
    this.autoSlideInterval = null;
    this.autoSlideDelay = 5000; // 5 seconds
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.wrapper = document.querySelector('.reviews-carousel-wrapper');
    this.track = document.querySelector('.reviews-track');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    this.indicatorsContainer = document.querySelector('.carousel-indicators');

    if (!this.wrapper || !this.track) {
      console.warn('Reviews carousel elements not found');
      return;
    }

    this.organizeReviews();
    this.createIndicators();
    this.attachEventListeners();
    this.startAutoSlide();
    
    // Pause auto-slide on hover
    this.wrapper.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.wrapper.addEventListener('mouseleave', () => this.startAutoSlide());
  }

  organizeReviews() {
    // Get all review cards
    const reviewCards = document.querySelectorAll('.review-card');
    const reviewsPerSlide = 3;
    const totalReviews = reviewCards.length;
    
    // Calculate number of slides needed
    this.totalSlides = Math.ceil(totalReviews / reviewsPerSlide);
    
    // Clear the track
    this.track.innerHTML = '';
    
    // Create slides
    for (let i = 0; i < this.totalSlides; i++) {
      const slideGrid = document.createElement('div');
      slideGrid.className = 'reviews-grid';
      
      // Add 3 reviews per slide
      for (let j = 0; j < reviewsPerSlide; j++) {
        const reviewIndex = i * reviewsPerSlide + j;
        if (reviewIndex < totalReviews) {
          const reviewClone = reviewCards[reviewIndex].cloneNode(true);
          slideGrid.appendChild(reviewClone);
        }
      }
      
      this.track.appendChild(slideGrid);
    }
  }

  createIndicators() {
    if (!this.indicatorsContainer) return;
    
    this.indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement('button');
      indicator.className = 'carousel-indicator';
      indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
      
      if (i === 0) {
        indicator.classList.add('active');
      }
      
      indicator.addEventListener('click', () => {
        this.goToSlide(i);
        this.stopAutoSlide();
        this.startAutoSlide();
      });
      
      this.indicatorsContainer.appendChild(indicator);
    }
    
    this.indicators = document.querySelectorAll('.carousel-indicator');
  }

  attachEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.previousSlide();
        this.stopAutoSlide();
        this.startAutoSlide();
      });
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.stopAutoSlide();
        this.startAutoSlide();
      });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const threshold = 50; // minimum swipe distance
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.previousSlide();
      }
      this.stopAutoSlide();
      this.startAutoSlide();
    }
  }

  goToSlide(index) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentSlide = index;
    
    // Calculate transform
    const slideWidth = this.wrapper.offsetWidth;
    const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
    const offset = -(slideWidth + gap) * this.currentSlide;
    
    this.track.style.transform = `translateX(${offset}px)`;
    
    // Update indicators
    this.updateIndicators();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600); // Match CSS transition duration
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  updateIndicators() {
    if (!this.indicators) return;
    
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  startAutoSlide() {
    this.stopAutoSlide(); // Clear any existing interval
    
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Responsive: update on window resize
  handleResize() {
    this.goToSlide(this.currentSlide);
  }
}

// Initialize carousel
const reviewsCarousel = new ReviewsCarousel();

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (reviewsCarousel.handleResize) {
      reviewsCarousel.handleResize();
    }
  }, 250);
});
