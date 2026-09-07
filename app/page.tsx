export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <img className="nav-logo" src="/nav/logo.svg" alt="Codebanas" width={29.538} height={32} />
        <div className="nav-actions">
          <a className="nav-cta" href="mailto:hello@codebanas.com">
            <span>JOIN US</span>
          </a>
          <img className="nav-icon nav-sign-in" src="/nav/sign-in.svg" alt="Sign in" width={19.961} height={20} />
          <img className="nav-divider" src="/nav/divider.svg" alt="" width={32} height={24} />
          <img className="nav-icon" src="/nav/search.svg" alt="Search" width={20} height={20} />
          <img className="nav-icon nav-menu" src="/nav/menu.png" alt="Menu" width={20} height={10} />
        </div>
      </nav>
    </main>
  );
}
