const capabilities = [
  ["01", "Strategy & direction", "Turn an early idea into a site with a sharp point of view and a clear job to do."],
  ["02", "Design that works", "Distinctive visual systems built to make the right first impression and earn attention."],
  ["03", "Fast, solid builds", "Responsive, accessible websites engineered with a modern stack and room to grow."],
];

const projects = [
  { label: "STUDIO NORTH", type: "Brand & digital", className: "project-one" },
  { label: "MOSS MARKET", type: "Commerce", className: "project-two" },
  { label: "DEAR RIVER", type: "Hospitality", className: "project-three" },
];

function ArrowUpRight() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <nav className="nav" aria-label="Main navigation">
          <a href="#top" className="wordmark" aria-label="Codebanas home">
            <span className="wordmark-mark">C.</span>CODEBANAS
          </a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </div>
          <a href="#contact" className="nav-cta">Start a project <ArrowUpRight /></a>
        </nav>

        <div id="top" className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Independent digital studio · New York</p>
            <h1>Built for<br /><em>the next move.</em></h1>
            <p className="hero-intro">We make focused websites for businesses with somewhere to go. Strategy, design, and development—under one roof.</p>
            <a href="#contact" className="button button-light">Let&apos;s make it happen <ArrowUpRight /></a>
          </div>

          <div className="hero-art" aria-label="Abstract Codebanas visual identity">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="sun">C<span>+</span></div>
            <div className="art-caption art-caption-top">2026<br />CREATIVE<br />PARTNER</div>
            <div className="art-caption art-caption-bottom">NO<br />TEMPLATES<br />JUST MOMENTUM</div>
            <div className="stamp">CB<br /><span>STUDIO</span></div>
          </div>
        </div>

        <div className="hero-footer">
          <span>Scroll to explore</span>
          <span className="hero-rule" />
          <span>Strategy · Design · Technology</span>
        </div>
      </section>

      <section id="work" className="work-section section-shell">
        <div className="section-heading">
          <p className="eyebrow"><span /> Selected work</p>
          <h2>Make your<br /><em>mark.</em></h2>
          <a href="#contact" className="text-link">See what&apos;s possible <ArrowUpRight /></a>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article className={`project ${project.className}`} key={project.label}>
              <div className="project-no">0{index + 1}</div>
              <div className="project-art" aria-hidden="true">
                {index === 0 && <><i /><b /></>}
                {index === 1 && <><i /><i /><i /></>}
                {index === 2 && <><i /><b /><strong /></>}
              </div>
              <div className="project-meta"><span>{project.label}</span><span>{project.type}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="services-section section-shell">
        <div className="section-heading services-heading">
          <p className="eyebrow"><span /> What we do</p>
          <h2>Good work<br />moves <em>people.</em></h2>
        </div>
        <div className="capability-list">
          {capabilities.map(([number, title, text]) => (
            <article className="capability" key={number}>
              <span className="capability-number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowUpRight />
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="statement-section">
        <p className="statement-label">Small team. Serious energy.</p>
        <p className="statement">We combine the thinking of a consultancy, the taste of a design studio, and the pace of a startup.</p>
        <div className="statement-graphic"><span>CB</span><i /><i /><i /><i /></div>
      </section>

      <section id="contact" className="contact-section section-shell">
        <div>
          <p className="eyebrow"><span /> Have a project?</p>
          <h2>Let&apos;s build<br /><em>something good.</em></h2>
        </div>
        <a className="contact-email" href="mailto:hello@codebanas.com">hello@codebanas.com <ArrowUpRight /></a>
      </section>

      <footer className="footer section-shell">
        <a href="#top" className="wordmark"><span className="wordmark-mark">C.</span>CODEBANAS</a>
        <p>© {new Date().getFullYear()} Codebanas. Made with intent.</p>
        <div><a href="#top">Instagram</a><a href="#top">LinkedIn</a></div>
      </footer>
    </main>
  );
}
