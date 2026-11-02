"use client";

import { useEffect, useRef } from "react";
import type { CardAppearance } from "@/lib/card-styles";

export default function CardTexture({ appearance }: { appearance: CardAppearance }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const updatePlayback = () => {
      if (visible && !reducedMotion.matches && !document.hidden) {
        void video.play().catch(() => {
          // Keep the color visible if the browser restricts video playback.
        });
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });

    observer.observe(video);
    reducedMotion.addEventListener("change", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [appearance.texture.src]);

  const style = { mixBlendMode: appearance.blendMode };

  if (appearance.texture.type === "video") {
    return (
      <video
        className="code-card-texture"
        ref={videoRef}
        src={appearance.texture.src}
        style={style}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  return (
    <img
      className="code-card-texture"
      src={appearance.texture.src}
      style={style}
      alt=""
      loading="lazy"
      draggable={false}
    />
  );
}
