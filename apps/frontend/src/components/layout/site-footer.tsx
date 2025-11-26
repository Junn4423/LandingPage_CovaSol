export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {year} COVASOL Technology Solutions. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="mailto:covasol.studio@gmail.com" className="hover:text-brand-primary">
            Email
          </a>
          <a href="https://www.facebook.com/covasol" target="_blank" rel="noreferrer" className="hover:text-brand-primary">
            Facebook
          </a>
          <a href="https://www.linkedin.com/company/covasol" target="_blank" rel="noreferrer" className="hover:text-brand-primary">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
