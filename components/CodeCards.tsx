"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const cards = [
  { code: "KX7M2", price: 79, rate: "0.3%", artwork: "yellow", color: "amber" },
  { code: "VR9Q4", price: 99, rate: "0.2%", artwork: "blue", color: "blue" },
  { code: "NL6P8", price: 149, rate: "0.5%", artwork: "green", color: "green" },
  { code: "JW3T5", price: 89, rate: "0.4%", artwork: "pink", color: "pink" },
  { code: "ZX8H1", price: 129, rate: "0.7%", artwork: "yellow", color: "yellow" },
  { code: "BQ4R7", price: 169, rate: "0.6%", artwork: "purple", color: "purple" },
  { code: "FD2K9", price: 109, rate: "0.9%", artwork: "purple", color: "teal" },
];

export default function CodeCards() {
  const viewport = useRef<HTMLDivElement>(null);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    const centerCards = () => {
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
    };

    const observer = new ResizeObserver(centerCards);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function toggleSaved(code: string) {
    setSavedCodes((saved) =>
      saved.includes(code) ? saved.filter((item) => item !== code) : [...saved, code],
    );
  }

  return (
    <section className="code-gallery" aria-label="Explore sample codes">
      <div className="code-gallery-viewport" ref={viewport}>
        <div className="code-gallery-track">
          {cards.map((card) => {
            const isSaved = savedCodes.includes(card.code);

            return (
              <article className="code-card" key={card.code} aria-labelledby={`code-${card.code}`}>
                <div className="code-card-details">
                  <div className="code-card-header">
                    <h2 className="code-card-name" id={`code-${card.code}`}>
                      <img src="/cards/verify.svg" alt="Verified" width={16} height={16} />
                      {card.code}
                    </h2>
                    <div className="code-card-actions">
                      <button
                        className="code-card-save"
                        type="button"
                        aria-label={`${isSaved ? "Unsave" : "Save"} ${card.code}`}
                        aria-pressed={isSaved}
                        onClick={() => toggleSaved(card.code)}
                      >
                        <img src="/cards/heart-light-pink.svg" alt="" width={19} height={16} />
                      </button>
                      <img src="/cards/arrow-dark-single.svg" alt="" width={12} height={12} />
                    </div>
                  </div>
                  <div className="code-card-numbers">
                    <span>${card.price}</span>
                    <span className="code-card-rate">{card.rate}</span>
                  </div>
                </div>
                <Image
                  className={`code-card-art code-card-art-${card.color}`}
                  src={`/cards/art-${card.artwork}.png`}
                  alt=""
                  width={272}
                  height={192}
                  sizes="272px"
                  draggable={false}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
