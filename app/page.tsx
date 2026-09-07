import { Fragment } from "react";

const headlineWords = "Claim your awards or search our database for codes easily.".split(" ");
const codes = [
  { code: "XGH - 6QR", claimed: 50 },
  { code: "RT2 - LAC", claimed: 10 },
  { code: "BDZ - MPK", claimed: 5 },
];

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
    </main>
  );
}
