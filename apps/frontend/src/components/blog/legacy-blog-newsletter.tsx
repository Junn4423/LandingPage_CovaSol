"use client";

export function LegacyBlogNewsletter() {
  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-content" data-aos="fade-up">
          <h2 data-key="newsletter-title">Đăng ký nhận bản tin</h2>
          <p data-key="newsletter-description">
            Nhận những bài viết mới nhất và insights về công nghệ từ COVASOL. Chúng tôi sẽ gửi bạn nội dung chất lượng mỗi tuần.
          </p>
          <form className="newsletter-form" onSubmit={event => event.preventDefault()}>
            <label htmlFor="newsletterEmail" className="sr-only">
              Email của bạn
            </label>
            <input id="newsletterEmail" type="email" placeholder="Email của bạn" data-key="newsletter-email" required />
            <button type="submit" className="btn btn-primary" data-key="subscribe">
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
