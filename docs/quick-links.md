# Quick-links final screen

The final screen uses the original `GIFER.gif`, copied unchanged to
`public/gallery/quick-links-background.gif`. It replaces the six decorative
stickers with a full-width animated background anchored to the viewport bottom.

The background starts 24px above the menu's top (`--quick-links-art-gap: -24px`),
so the links sit over its fade. The panel targets 62% of the dynamic viewport
height, between 240px and 560px, with a further clamp for short screens to leave
room below the header. The menu still shows three 44px rows with 12px gaps.
Menu position and background height share CSS variables on
`.quick-links-sticky-track`, keeping the panel at the real screen bottom.

The background uses the same `public/nav/blur-top.png` as the navigation across
its top 160px, including the desktop 60% opacity and full mobile/tablet opacity.
Screen blending preserves the page background behind the GIF's black pixels.

The background reveals at the end of page scrolling. Further vertical wheel or
touch gestures anywhere on that screen scroll only the link window. Scrolling
up from Home returns to the page. Avoid positioning the background layer
above the viewport bottom: that leaves the blank strip the design excludes.

The panel uses a 720ms upward entrance and a matching downward exit with
mirrored easing. Travel is based on its own height. Reduced-motion mode skips
the transitions and hides the animated GIF.
