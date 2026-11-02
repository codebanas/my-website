export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="nav-brand">
            <a className="nav-logo" href="/" aria-label="Codebanas home">
              <img src="/nav/profile-logo.svg" alt="" width={42} height={12} />
            </a>
            <button className="profile-button" type="button">
              <span>Setup a Profile</span>
              <img src="/nav/arrow-white-circle.svg" alt="" width={16} height={16} />
            </button>
          </div>

          <div className="nav-actions">
            <button className="nav-icon-button" type="button" aria-label="Search">
              <img src="/nav/search.svg" alt="" width={20} height={20} />
            </button>
            <button className="nav-icon-button" type="button" aria-label="More options">
              <img src="/nav/circle-ellipsis.svg" alt="" width={20} height={20} />
            </button>
          </div>
        </nav>
      </header>
      <main aria-label="Codebanas" />
    </>
  );
}
