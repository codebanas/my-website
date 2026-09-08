import { Fragment } from "react";
import { InfoBadge } from "@/components/InfoBadge";
import { PricingCarousel } from "@/components/PricingCarousel";
import { SectionStack } from "@/components/SectionStack";

const headlineWords = "Claim your awards or search our database for codes easily.".split(" ");
const codeGroups = [
  [
    { code: "XGH - 6QR", claimed: 20, total: 50 },
    { code: "RT2 - LAC", claimed: 7, total: 18 },
    { code: "BDZ - MPK", claimed: 3, total: 12 },
  ],
  [
    { code: "NV4 - KQ8", claimed: 31, total: 64 },
    { code: "P7M - 2WX", claimed: 14, total: 35 },
    { code: "J9C - VR5", claimed: 42, total: 80 },
  ],
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
      <SectionStack>
      <div className="section-hello-wrap stack-section">
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
          <InfoBadge className="codes-availability">
            <strong>120 Codes Available</strong>
            <img src="/codes/dot.svg" alt="" width={4} height={4} />
            <time dateTime="2026-08-29">August 29, 2026</time>
          </InfoBadge>
          <div className="codes-groups">
            {codeGroups.map((group, groupIndex) => (
              <ul
                className={`codes-list${groupIndex === 1 ? " codes-list--repeat" : ""}`}
                aria-label={`Available codes group ${groupIndex + 1}`}
                key={groupIndex}
              >
                {group.map(({ code, claimed, total }) => (
                  <li className="codes-row" key={code}>
                    <span className="codes-value"><span>{code}</span></span>
                    <img className="codes-arrow" src="/codes/arrow.svg" alt="" width={16} height={12} />
                    <span className="codes-claimed" aria-label={`${claimed} of ${total} claimed`}>[{claimed}/{total}]</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <img className="section-barcode section-barcode--mobile" src="/codes/barcode.svg" alt="" />
      </section>
      </div>
      <div className="section-pricing-wrap stack-section">
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

          <InfoBadge className="pricing-referral">
            <a href="#">Invite A Friend</a>
            <img src="/codes/dot.svg" alt="" width={4} height={4} />
            <span>Get 5% Off Discount</span>
          </InfoBadge>

          <PricingCarousel count={plans.length}>
            {plans.map(({ price, name, current }) => (
              <article className="pricing-plan" key={price}>
                <h3>{price}</h3>
                <div className="pricing-labels" aria-label={`${name} plan`}>
                  {["right", "left"].map((direction) => (
                    <div className={`pricing-label-row pricing-label-row--${direction}`} aria-hidden="true" key={direction}>
                      <div className="pricing-label-track">
                        {[0, 1].map((setIndex) => (
                          <div className="pricing-label-set" key={setIndex}>
                            {[0, 1, 2, 3].map((itemIndex) => <span key={itemIndex}>{name} PLAN</span>)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="pricing-features">
                  {planFeatures.map(({ included, label }) => (
                    <li key={label}>
                      <span
                        className={`pricing-mark pricing-mark--${included ? "check" : "cross"}`}
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button className={current ? "pricing-button pricing-button--current" : "pricing-button"} type="button">
                  {current ? "CURRENT" : "UPGRADE"}
                </button>
              </article>
            ))}
          </PricingCarousel>
          <img className="section-barcode section-barcode--mobile" src="/codes/barcode.svg" alt="" />
        </section>
      </div>
      </SectionStack>
    </main>
    </>
  );
}
