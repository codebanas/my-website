"use client";

import { useEffect, useRef, useState } from "react";
import CardTexture from "@/components/CardTexture";
import ProgressiveFade from "@/components/ProgressiveFade";
import { getCardAppearance, getCardColor, type CardAppearance } from "@/lib/card-styles";
import { shuffle } from "@/lib/shuffle";

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

export default function CodeCards({
  cards = sampleCards,
  startIndex = 0,
}: {
  cards?: CodeCardData[];
  startIndex?: number;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const ranks = new Map(cardOrder.map((id, index) => [id, index]));
  const orderedCards = cardOrder.length
    ? [...cards].sort((a, b) =>
      (ranks.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (ranks.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    )
    : cards;
  const visibleCards = favoritesOnly
    ? orderedCards.filter((card) => savedCodes.includes(card.id))
    : orderedCards;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    const centerCards = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const center = (element.scrollWidth - element.clientWidth) / 2;
      element.scrollLeft = Math.round(center * pixelRatio) / pixelRatio;
    };

    let previousWidth: number | undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width === previousWidth) return;
      previousWidth = width;
      centerCards();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [favoritesOnly]);

  function toggleSaved(code: string) {
    setSavedCodes((saved) =>
      saved.includes(code) ? saved.filter((item) => item !== code) : [...saved, code],
    );
  }

  function shuffleVisibleCards() {
    const shuffled = shuffle(visibleCards);
    const visibleIds = new Set(visibleCards.map((card) => card.id));
    let index = 0;
    setCardOrder(
      orderedCards.map((card) => visibleIds.has(card.id) ? shuffled[index++].id : card.id),
    );
  }

  return (
    <section className="code-gallery" aria-labelledby="gallery-title">
      <div className="gallery-toolbar">
        <h2 className="gallery-title" id="gallery-title">
          [ / Friends with Benefits ]
        </h2>
        <div className="gallery-toolbar-actions">
          <button
            className="gallery-favorites"
            type="button"
            aria-label="Show saved cards"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((current) => !current)}
          >
            <img src="/gallery/heart.svg" alt="" width={19} height={16} />
          </button>
          <button
            className="shuffle-button"
            type="button"
            onClick={shuffleVisibleCards}
            disabled={visibleCards.length < 2}
          >
            <img src="/gallery/shuffle.svg" alt="" width={20} height={20} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>
      <div className="code-slider">
        <ProgressiveFade
          edge="left"
          strength={2}
          maxBlur={14}
          tintOpacity={0.8}
          className="slider-fade slider-fade-left"
        />
        <ProgressiveFade
          edge="right"
          strength={2}
          maxBlur={14}
          tintOpacity={0.8}
          className="slider-fade slider-fade-right"
        />
        <div className="code-gallery-viewport" ref={viewport}>
          {visibleCards.length === 0 ? (
            <p className="code-gallery-empty" role="status">Save a card with its heart to see it here.</p>
          ) : (
            <div className="code-gallery-track">
              {visibleCards.map((card, index) => {
                const isSaved = savedCodes.includes(card.id);
                const position = startIndex + index;
                const appearance = {
                  ...(card.appearance ?? getCardAppearance(card.id, position)),
                  color: getCardColor(position),
                };

                return (
                  <article className="code-card" key={card.id} aria-labelledby={`code-${card.id}`}>
                    <div className="code-card-surface" aria-hidden="true">
                      <div
                        className="code-card-art"
                        style={{ backgroundColor: `var(--card-${appearance.color})` }}
                      >
                        <CardTexture appearance={appearance} />
                      </div>
                    </div>
                    <div className="code-card-details">
                      <div className="code-card-header">
                        <h3 className="code-card-name" id={`code-${card.id}`}>
                          <img src="/cards/verify.svg" alt="Verified" width={16} height={16} />
                          {card.code}
                        </h3>
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
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
