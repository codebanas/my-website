"use client";

import { useEffect, useRef, type RefObject } from "react";

export default function QuickLinksArtwork({ visible, anchor }: {
  visible: boolean;
  anchor: RefObject<HTMLElement | null>;
}) {
  const artwork = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    function updatePosition() {
      frame = 0;
      if (!anchor.current || !artwork.current) return;
      artwork.current.style.setProperty("--quick-links-art-top", `${anchor.current.getBoundingClientRect().top}px`);
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    }
    updatePosition();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [visible, anchor]);

  return (
    <div className="quick-links-artwork" data-visible={visible} aria-hidden="true" ref={artwork}>
      <div className="quick-links-art-group quick-links-art-left">
        <img className="quick-links-art art-bbf" src="/arts/lets-be-bbf.svg" alt="" width={264} height={264} draggable={false} />
        <img className="quick-links-art art-globe" src="/arts/blue-box-green-globe.svg" alt="" width={159} height={159} draggable={false} />
        <img className="quick-links-art art-banas" src="/arts/banas-pink-box.svg" alt="" width={141} height={83} draggable={false} />
      </div>
      <div className="quick-links-art-group quick-links-art-right">
        <img className="quick-links-art art-code" src="/arts/pink-rectangle-code.svg" alt="" width={299} height={170} draggable={false} />
        <img className="quick-links-art art-at" src="/arts/blue-white-at-symbol.svg" alt="" width={262} height={220} draggable={false} />
        <img className="quick-links-art art-hands" src="/arts/yellow-box-black-hands.svg" alt="" width={179} height={179} draggable={false} />
      </div>
    </div>
  );
}
