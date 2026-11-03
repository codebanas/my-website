import CodeCards from "@/components/CodeCards";
import HeroText from "@/components/HeroText";
import QuickLinksCue from "@/components/QuickLinksCue";
import QuickLinks from "@/components/QuickLinks";

export default function Home() {
  return (
    <>
      <img
        className="nav-fade"
        src="/nav/blur-top.png"
        alt=""
        aria-hidden="true"
        width={7680}
        height={720}
        draggable={false}
      />
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="nav-brand">
            <a className="nav-logo" href="/" aria-label="Codebanas home">
              <img src="/nav/profile-logo.svg" alt="" width={42} height={12} />
            </a>
            <button className="pill-button profile-button" type="button">
              <span>Create an Account</span>
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
      <main className="home-content" aria-label="Codebanas">
        <HeroText />
        <div className="supporter-content">
          <CodeCards />
          <div className="quick-links-section">
            <QuickLinksCue />
            <div className="quick-links-sticky-track">
              <QuickLinks />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
