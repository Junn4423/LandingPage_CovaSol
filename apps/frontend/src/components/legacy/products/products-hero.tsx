interface ProductsHeroProps {
  videoSrc?: string;
  title: string;
  description: string;
  titleKey: string;
  descriptionKey: string;
}

export function ProductsHero({ title, description, titleKey, descriptionKey }: ProductsHeroProps) {
  return (
    <section className="yatame-blog-hero">
      <div className="container">
        <h1 data-aos="fade-up" data-key={titleKey}>
          {title}
        </h1>
        <p data-aos="fade-up" data-aos-delay="100" data-key={descriptionKey}>
          {description}
        </p>
      </div>
    </section>
  );
}
