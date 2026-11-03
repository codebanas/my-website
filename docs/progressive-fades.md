# Figma fade overlays

The page uses the user's original Figma PNG exports, stored unchanged with
their alpha transparency. These static overlays replace the generated
gradients and backdrop-blur bands. No extra tint or opacity is applied.

The top image is `public/nav/blur-top.png`, a 7680 by 720 pixel export. It stays
fixed across the full viewport width at the existing 160px height, behind the
navigation. Its z-index is 10; the navigation is 20 and the sticky quick-links
menu is 11, keeping those controls above the fade.

The top PNG is the earlier, lighter export. Each hero heading line, the hero
description, and the gallery toolbar also fade independently on page scroll.
Each starts at full opacity at its unscrolled document position and reaches
25% opacity when its top edge reaches 32px from the viewport top. Opacity
stays at 25% beyond that marker and returns to 100% when scrolled back.
The positions are measured again after resizing, layout changes, or font
loading. Card contents and the fixed navigation do not use this scroll fade.

The slider uses the user's original Figma exports, stored unchanged at
`public/gallery/blur-left.png` and `public/gallery/blur-right.png`. Both files
are 1060 by 1720 pixels with alpha transparency. They render at 265px wide by
430px high on desktop, matching the exports at one-quarter scale, centered
vertically and anchored to their respective screen edges. The images replace
the slider's generated gradient and backdrop-blur bands.

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

`ProgressiveFade` and its helper remain available for reuse, but the current
page uses the PNG overlays for both the navigation and slider sides.

References:

- [Figma blur effects](https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers)
- [CSS backdrop filtering and backdrop roots](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [CSS masking](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking)
