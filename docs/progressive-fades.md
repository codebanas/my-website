# Progressive fades

`ProgressiveFade` renders decorative overlays without applying filters or masks
to the content container. Eight masked backdrop-filter bands approximate a
progressive blur from 16px at the outer edge to clear at the inner edge. Both
standard and WebKit-prefixed mask/backdrop-filter properties are supplied.

The top overlay stays fixed at 160px high with six darkening gradient layers.

The slider uses the user's original Figma exports, stored unchanged at
`public/gallery/blur-left.png` and `public/gallery/blur-right.png`. Both files
are 1060 by 1720 pixels with alpha transparency. They render at 265px wide by
430px high on desktop, matching the exports at one-quarter scale, centered
vertically and anchored to their respective screen edges. The images replace
the slider's generated gradient and backdrop-blur bands; the top navigation
still uses `ProgressiveFade`.

The overlay height extends beyond the cards to cover the whole outer card;
the toolbar sits above the overlays so its text and buttons stay crisp. On
mobile and tablet screens below 1024px, each image compresses horizontally to
32px, preserving the existing narrow side treatment. PNG transparency supplies
the fading directly, without extra tint layers or opacity adjustments. Overlay
pointer events and image dragging are disabled so the slider remains usable.

The card slider spans the full viewport width, including the side overlays.
Only the hero and gallery toolbar use the centered 1393px content container.
The slider therefore reveals the partial outer cards beyond the toolbar edges,
and the side fades end at the screen edges rather than at the content container.

The top overlay is a browser approximation of Figma's progressive blur, rather
than a native variable-radius CSS filter. If backdrop filtering is unsupported,
its darkening gradients remain visible. The side images are static overlays.

References:

- [Figma blur effects](https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers)
- [CSS backdrop filtering and backdrop roots](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [CSS masking](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking)
