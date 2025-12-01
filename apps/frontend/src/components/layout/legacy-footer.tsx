/* eslint-disable @next/next/no-img-element */
export function LegacyFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/assets/img/logo.png" alt="COVASOL Logo" />
            <span>COVASOL</span>
          </div>
          <div className="footer-text">
            <p>&copy; {year} COVASOL. All rights reserved.</p>
            <p>Core Value. Smart Solutions.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
