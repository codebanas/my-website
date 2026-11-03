"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import CardTexture from "@/components/CardTexture";
import { startCardAutoScroll, wrapCardScroll } from "@/lib/card-auto-scroll";
import { getCardAppearance, getCardColor, type CardAppearance } from "@/lib/card-styles";
import { groupFavorites, shuffle, shuffleWithFavorites } from "@/lib/shuffle";

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
  { id: "QM5V8", code: "QM5V8", price: 119, rate: "0.4%" },
  { id: "TR8N3", code: "TR8N3", price: 89, rate: "0.6%" },
  { id: "HP4X7", code: "HP4X7", price: 139, rate: "0.8%" },
  { id: "LC9R2", code: "LC9R2", price: 99, rate: "0.3%" },
  { id: "BV6K5", code: "BV6K5", price: 159, rate: "0.7%" },
  { id: "WN2J8", code: "WN2J8", price: 129, rate: "0.5%" },
  { id: "AS7D4", code: "AS7D4", price: 179, rate: "0.9%" },
  { id: "PF3M6", code: "PF3M6", price: 79, rate: "0.2%" },
  { id: "GY8T2", code: "GY8T2", price: 149, rate: "0.6%" },
  { id: "EK5B9", code: "EK5B9", price: 109, rate: "0.4%" },
  { id: "DU4L7", code: "DU4L7", price: 189, rate: "0.8%" },
  { id: "MX9C3", code: "MX9C3", price: 119, rate: "0.5%" },
  { id: "RG6W2", code: "RG6W2", price: 169, rate: "0.7%" },
  { id: "JN7F5", code: "JN7F5", price: 139, rate: "0.3%" },
];

export default function CodeCards({
  cards = sampleCards,
  startIndex = 0,
}: {
  cards?: CodeCardData[];
  startIndex?: number;
}) {
  const gallery = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const loopWidth = useRef(0);
  const mouseDrag = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    active: boolean;
  } | null>(null);
  const suppressDragClick = useRef(false);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [groupSaved, setGroupSaved] = useState(false);
  const hasSavedCards = savedCodes.length > 0;
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const ranks = new Map(cardOrder.map((id, index) => [id, index]));
  const orderedCards = cardOrder.length
    ? [...cards].sort((a, b) =>
      (ranks.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (ranks.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    )
    : cards;
  const displayCards = groupSaved
    ? groupFavorites(orderedCards, new Set(savedCodes))
    : orderedCards;

  const centerSlider = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const track = element.querySelector(".code-gallery-track");
    const first = track?.children[0] as HTMLElement | undefined;
    const nextRun = track?.children[displayCards.length] as HTMLElement | undefined;
    loopWidth.current = first && nextRun ? nextRun.offsetLeft - first.offsetLeft : 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const center = (element.scrollWidth - element.clientWidth) / 2;
    element.scrollLeft = Math.round(center * pixelRatio) / pixelRatio;
  }, [displayCards.length]);

  const wrapSlider = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const position = wrapCardScroll(element.scrollLeft, loopWidth.current);
    const shift = position - element.scrollLeft;
    if (shift === 0) return;
    if (mouseDrag.current) mouseDrag.current.scrollLeft += shift;
    element.scrollLeft = position;
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    let previousWidth: number | undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width === previousWidth) return;
      previousWidth = width;
      centerSlider();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [groupSaved, centerSlider]);

  useEffect(() => {
    if (!viewport.current || !gallery.current) return;
    return startCardAutoScroll(viewport.current, gallery.current, () => loopWidth.current);
  }, [cards.length]);

  function startMouseDrag(event: PointerEvent<HTMLDivElement>) {
    suppressDragClick.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    mouseDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      active: false,
    };
  }

  function moveMouseDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!(event.buttons & 1)) {
      finishMouseDrag(event);
      return;
    }

    const distance = event.clientX - drag.startX;
    // Leave small movements as clicks so the card hearts still work normally.
    if (!drag.active && Math.abs(distance) < 6) return;
    if (!drag.active) {
      drag.active = true;
      suppressDragClick.current = true;
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const requested = drag.scrollLeft - distance;
    const position = wrapCardScroll(requested, loopWidth.current);
    drag.scrollLeft += position - requested;
    event.currentTarget.scrollLeft = position;
  }

  function finishMouseDrag(event: PointerEvent<HTMLDivElement>) {
    if (mouseDrag.current?.pointerId !== event.pointerId) return;
    mouseDrag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function toggleSaved(code: string) {
    const nextSaved = savedCodes.includes(code)
      ? savedCodes.filter((item) => item !== code)
      : [...savedCodes, code];
    setSavedCodes(nextSaved);
    if (nextSaved.length === 0) setGroupSaved(false);
  }

  function shuffleAllCards() {
    const shuffled = groupSaved
      ? shuffleWithFavorites(orderedCards, new Set(savedCodes))
      : shuffle(orderedCards);
    setCardOrder(shuffled.map((card) => card.id));
    if (groupSaved && hasSavedCards) centerSlider();
  }

  return (
    <section className="code-gallery" aria-labelledby="gallery-title" ref={gallery}>
      <div className="gallery-toolbar" data-scroll-fade>
        <h2 className="gallery-title" id="gallery-title">
          [ / Benefits Reel ]
        </h2>
        <div className="gallery-toolbar-actions">
          <button
            className="gallery-favorites"
            type="button"
            aria-label="Group saved cards"
            aria-pressed={groupSaved}
            disabled={!hasSavedCards}
            onClick={() => setGroupSaved((current) => !current)}
          >
            <img
              src={groupSaved ? "/gallery/heart-pink.svg" : "/gallery/heart.svg"}
              alt=""
              width={19}
              height={16}
            />
          </button>
          <button
            className="shuffle-button"
            type="button"
            onClick={shuffleAllCards}
            disabled={orderedCards.length < 2}
          >
            <img src="/gallery/shuffle.svg" alt="" width={20} height={20} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>
      <div className="code-slider">
        <img
          src="/gallery/blur-left.png"
          alt=""
          aria-hidden="true"
          width={1060}
          height={1720}
          draggable={false}
          className="slider-fade slider-fade-left"
        />
        <img
          src="/gallery/blur-right.png"
          alt=""
          aria-hidden="true"
          width={1060}
          height={1720}
          draggable={false}
          className="slider-fade slider-fade-right"
        />
        <div
          className="code-gallery-viewport"
          ref={viewport}
          data-looped={displayCards.length > 1}
          onScroll={wrapSlider}
          onPointerDown={startMouseDrag}
          onPointerMove={moveMouseDrag}
          onPointerUp={finishMouseDrag}
          onPointerCancel={finishMouseDrag}
          onLostPointerCapture={finishMouseDrag}
          onPointerLeave={(event) => {
            if (!mouseDrag.current?.active) finishMouseDrag(event);
          }}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (suppressDragClick.current && event.detail > 0) {
              event.preventDefault();
              event.stopPropagation();
              suppressDragClick.current = false;
            }
          }}
        >
          {displayCards.length === 0 ? (
            <p className="code-gallery-empty" role="status">No cards available yet.</p>
          ) : (
            <div className="code-gallery-track">
              {(displayCards.length > 1 ? [0, 1, 2] : [1]).flatMap((copy) => displayCards.map((card, index) => {
                const isClone = copy !== 1;
                const isSaved = savedCodes.includes(card.id);
                const headingId = `code-${card.id}-${copy}`;
                const heart = (
                  <img
                    src={isSaved ? "/cards/heart-pink.svg" : "/cards/heart-light-pink.svg"}
                    alt=""
                    width={19}
                    height={16}
                  />
                );
                const position = startIndex + index;
                const appearance = {
                  ...(card.appearance ?? getCardAppearance(card.id, position)),
                  color: getCardColor(position),
                };

                return (
                  <article
                    className="code-card"
                    key={`${copy}-${card.id}`}
                    data-card-id={card.id}
                    data-loop-copy={copy}
                    aria-labelledby={headingId}
                    aria-hidden={isClone ? true : undefined}
                  >
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
                        <h3 className="code-card-name" id={headingId}>
                          <img src="/cards/verify.svg" alt="Verified" width={18} height={18} />
                          {card.code}
                        </h3>
                        <div className="code-card-actions">
                          {isClone ? (
                            <span className="code-card-save" onClick={() => toggleSaved(card.id)}>{heart}</span>
                          ) : (
                            <button
                              className="code-card-save"
                              type="button"
                              aria-label={`${isSaved ? "Unsave" : "Save"} ${card.code}`}
                              aria-pressed={isSaved}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={(event) => {
                                if (event.detail > 0) event.currentTarget.blur();
                                toggleSaved(card.id);
                              }}
                            >
                              {heart}
                            </button>
                          )}
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
              }))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
