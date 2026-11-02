"use client";

import { useEffect, useRef, useState } from "react";
import CardTexture from "@/components/CardTexture";
import { getCardAppearance, type CardAppearance } from "@/lib/card-styles";

export type CodeCardData = {
  id: string;
  code: string;
  price: number;
  rate: string;
  appearance?: CardAppearance;
};

const sampleCards: CodeCardData[] = [
  { id: "KX7M2", code: "KX7M2", price: 79, rate: "0.3%" },
  { id: "VR9Q4", code: "VR9Q4", price: 99, rate: "0.2%" },
  { id: "NL6P8", code: "NL6P8", price: 149, rate: "0.5%" },
  { id: "JW3T5", code: "JW3T5", price: 89, rate: "0.4%" },
  { id: "ZX8H1", code: "ZX8H1", price: 129, rate: "0.7%" },
  { id: "BQ4R7", code: "BQ4R7", price: 169, rate: "0.6%" },
  { id: "FD2K9", code: "FD2K9", price: 109, rate: "0.9%" },
];

export default function CodeCards({ cards = sampleCards }: { cards?: CodeCardData[] }) {
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
            const isSaved = savedCodes.includes(card.id);
            const appearance = card.appearance ?? getCardAppearance(card.id);

            return (
              <article className="code-card" key={card.id} aria-labelledby={`code-${card.id}`}>
                <div className="code-card-details">
                  <div className="code-card-header">
                    <h2 className="code-card-name" id={`code-${card.id}`}>
                      <img src="/cards/verify.svg" alt="Verified" width={16} height={16} />
                      {card.code}
                    </h2>
                    <div className="code-card-actions">
                      <button
                        className="code-card-save"
                        type="button"
                        aria-label={`${isSaved ? "Unsave" : "Save"} ${card.code}`}
                        aria-pressed={isSaved}
                        onClick={() => toggleSaved(card.id)}
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
                <div
                  className="code-card-art"
                  style={{ backgroundColor: `var(--card-${appearance.color})` }}
                  aria-hidden="true"
                >
                  <CardTexture appearance={appearance} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
