import Link from 'next/link';

interface ProductsCtaProps {
  title: string;
  description: string;
  titleKey: string;
  descriptionKey: string;
  primaryCta: {
    label: string;
    href: string;
    key: string;
  };
  secondaryCta: {
    label: string;
    href: string;
    key: string;
  };
}

export function ProductsCta({ title, description, titleKey, descriptionKey, primaryCta, secondaryCta }: ProductsCtaProps) {
  return (
    <section className="yatame-cta-section">
      <div className="container">
        <div className="yatame-cta-content" data-aos="fade-up">
          <h2 data-key={titleKey}>{title}</h2>
          <p data-key={descriptionKey}>{description}</p>
          <div className="yatame-cta-buttons">
            <Link href={primaryCta.href as any} className="btn btn-primary" data-key={primaryCta.key}>
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href as any} className="btn btn-outline" data-key={secondaryCta.key}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
