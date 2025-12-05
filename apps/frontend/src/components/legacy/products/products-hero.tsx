interface ProductsHeroProps {
  videoSrc: string;
  title: string;
  description: string;
  titleKey: string;
  descriptionKey: string;
}

export function ProductsHero({ videoSrc, title, description, titleKey, descriptionKey }: ProductsHeroProps) {
  return (
    <section className="page-hero products-hero">
      <div className="hero-media" aria-hidden="true">
        <video autoPlay muted loop playsInline preload="metadata">
          <source src={videoSrc} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        <div className="hero-media-overlay" />
      </div>
      <div className="hero-container">
        <div className="hero-content" data-aos="fade-up">
          <h1 className="page-title" data-key={titleKey}>
            {title}
          </h1>
          <p className="page-description" data-key={descriptionKey}>
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
