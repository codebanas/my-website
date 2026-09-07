import { Fragment } from "react";

const headlineWords = "Claim your awards or search our database for codes easily.".split(" ");
const codes = [
  { code: "XGH - 6QR", claimed: 50 },
  { code: "RT2 - LAC", claimed: 10 },
  { code: "BDZ - MPK", claimed: 5 },
];

const plans = [
  { price: "FREE", name: "STARTER", current: true },
  { price: "$1.99", name: "ESSENTIAL" },
  { price: "$9.99", name: "PLUS" },
  { price: "$14.99", name: "PRO" },
  { price: "$24.99", name: "PREMIUM" },
];

const planFeatures = [
  { included: true, label: "Access To Database" },
  { included: true, label: "Access Rewards $1 - $5" },
  { included: true, label: "Only 1 Claim Every 24/Hr" },
  { included: false, label: "Receive Notification About New Codes." },
  { included: false, label: "No Filtering" },
];

const marqueeRows = [
  "CHOOSE YOUR PLAN • UNLOCK MORE CODES • CLAIM MORE REWARDS",
  "STARTER • ESSENTIAL • PLUS • PRO • PREMIUM",
];

export default function Home() {
  return (
    <>
    <div className="site-background" aria-hidden="true">
      <video className="site-background-video" autoPlay muted loop playsInline preload="auto">
        <source src="/background/video.mp4" type="video/mp4" />
      </video>
      <img className="site-background-gif" src="/background/gif.gif" alt="" />
    </div>
    <main>
      <nav className="nav" aria-label="Main navigation">
        <img className="nav-logo" src="/nav/logo.svg" alt="Codebanas" width={29.538} height={32} />
        <div className="nav-actions">
          <a className="nav-cta" href="mailto:hello@codebanas.com">
            <span>JOIN US</span>
          </a>
          <span className="nav-icon nav-sign-in" aria-hidden="true" />
          <img className="nav-divider" src="/nav/divider.svg" alt="" width={32} height={24} />
          <span className="nav-icon nav-search" aria-hidden="true" />
          <span className="nav-icon nav-menu" aria-hidden="true" />
        </div>
      </nav>
      <div className="section-hello-wrap">
      <section className="section-hello" id="section-hello" aria-labelledby="codes-heading">
        <header className="codes-intro">
          <div className="codes-intro-row">
            <div className="codes-greeting">
              <img src="/codes/hello.svg" alt="" width={48} height={24} />
              <span>HELLO</span>
            </div>
            <img className="codes-barcode" src="/codes/barcode.svg" alt="" width={147.693} height={20} />
          </div>
          <p>Easily access our exclusive standalone codes outside of the main community database.</p>
        </header>

        <h1 className="codes-heading" id="codes-heading">
          {headlineWords.map((word, index) => (
            <Fragment key={word}>
              <span className="codes-heading-word">{word}</span>
              {index < headlineWords.length - 1 && (
                <>
                  {" "}
                  {word !== "our" && <span className="codes-heading-space" aria-hidden="true" />}
                </>
              )}
            </Fragment>
          ))}
        </h1>

        <div className="codes-listing">
          <p className="codes-availability">
            <strong>120 Codes Available</strong>
            <img src="/codes/dot.svg" alt="" width={4} height={4} />
            <time dateTime="2026-08-29">August 29, 2026</time>
          </p>
          <div className="codes-groups">
            {[false, true].map((isRepeat) => (
              <ul
                className={`codes-list${isRepeat ? " codes-list--repeat" : ""}`}
                aria-label={isRepeat ? undefined : "Available codes and claim counts"}
                aria-hidden={isRepeat || undefined}
                key={String(isRepeat)}
              >
                {codes.map(({ code, claimed }) => (
                  <li className="codes-row" key={code}>
                    <span className="codes-value"><span>{code}</span></span>
                    <img className="codes-arrow" src="/codes/arrow.svg" alt="" width={16} height={12} />
                    <span className="codes-claimed" aria-label={`Claimed ${claimed} times`}>CLAIMED[{claimed}]</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
      </div>
      <div className="section-pricing-wrap">
        <section className="section-pricing" aria-labelledby="pricing-heading">
          <header className="pricing-intro">
            <div className="pricing-intro-row">
              <div className="pricing-greeting">
                <img src="/codes/hello.svg" alt="" width={48} height={24} />
                <h2 id="pricing-heading">SEE OUR PLANS</h2>
              </div>
              <img className="pricing-barcode" src="/codes/barcode.svg" alt="" width={147.693} height={20} />
            </div>
            <p>Easily access our exclusive standalone codes outside of the main community database.</p>
          </header>

          <p className="pricing-referral">
            <span>Invite A Friend</span>
            <span aria-hidden="true">•</span>
            <span>Get 5% Off Discount</span>
          </p>

          <div className="pricing-grid">
            {plans.map(({ price, name, current }) => (
              <article className="pricing-plan" key={price}>
                <h3>{price}</h3>
                <div className="pricing-labels" aria-label={`${name} plan`}>
                  <span>• FEATURES<br />• FEATURES</span>
                  <strong>{name}<br />{name}</strong>
                </div>
                <ul className="pricing-features">
                  {planFeatures.map(({ included, label }) => (
                    <li key={label}>
                      <span className="pricing-mark" aria-hidden="true">{included ? "✓" : "×"}</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button className={current ? "pricing-button pricing-button--current" : "pricing-button"} type="button">
                  {current ? "CURRENT" : "UPGRADE"}
                </button>
              </article>
            ))}
          </div>

          <div className="pricing-marquees" aria-hidden="true">
            {marqueeRows.map((text, rowIndex) => (
              <div className={`pricing-marquee pricing-marquee--${rowIndex === 0 ? "right" : "left"}`} key={text}>
                <div className="pricing-marquee-track">
                  {[0, 1].map((setIndex) => (
                    <div className="pricing-marquee-set" key={setIndex}>
                      {[0, 1, 2, 3].map((itemIndex) => <span key={itemIndex}>{text}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
