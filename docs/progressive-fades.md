# Figma fade overlays

The page uses the user's original Figma PNG exports, stored unchanged with
their alpha transparency. These static overlays replace the generated
gradients and backdrop-blur bands. No extra tint is applied; desktop navigation
and mobile side images use reduced opacity as described below.

The top image is `public/nav/blur-top.png`, a 7680 by 720 pixel export. It stays
fixed across the full viewport width at the existing 160px height, behind the
navigation. Its z-index is 10; the navigation is 20 and the sticky quick-links
menu is 11, keeping those controls above the fade. On desktop at 1024px and
above, the top image renders at 60% opacity for a gentler scroll fade. Mobile
and tablet keep the original image opacity.

The quick-links GIF background reuses this PNG across its top edge at the same
160px height and responsive opacity, letting the menu blend over the animation.

The top PNG is the earlier, lighter export. Each hero heading line, the hero
description, and the gallery toolbar also fade independently on page scroll.
Each starts at full opacity at its unscrolled document position and reaches
5% opacity when its top edge reaches 32px from the viewport top. Opacity
stays at 5% beyond that marker and returns to 100% when scrolled back.
The positions are measured again after resizing, layout changes, or font
loading. Card contents and the fixed navigation do not use this scroll fade.

The gallery toolbar sits 16px above the cards. It is shifted down 16px from
its previous position while the card strip stays in place. When the quick-links
artwork opens at the end of the page, the toolbar becomes fully transparent
and hidden from interaction. Scrolling back restores its normal scroll fade.

The slider uses the user's original Figma exports, stored unchanged at
`public/gallery/blur-left.png` and `public/gallery/blur-right.png`. Both files
are 1060 by 1720 pixels with alpha transparency. They render at 265px wide by
430px high on desktop, matching the exports at one-quarter scale, centered
vertically and anchored to their respective slider edges. The images replace
the slider's generated gradient and backdrop-blur bands.

The overlay height extends beyond the cards to cover the whole outer card;
the toolbar sits above the overlays so its text and buttons stay crisp. On
tablet screens from 768px to 1023px, each image compresses horizontally to
32px. On mobile below 768px, each is 12px wide at 50% opacity for a lighter
edge. PNG transparency supplies the fading directly, without extra tint layers. Overlay
pointer events and image dragging are disabled so the slider remains usable.

The card slider is inset by the navigation's responsive page gutter: 16px on
mobile, 32px on tablet, and 64px on desktop. The side overlays follow these
slider edges. Hero and gallery toolbar still use the centered 1393px container.

`ProgressiveFade` and its helper remain available for reuse, but the current
page uses the PNG overlays for the navigation, slider sides, and GIF background.

References:

- [Figma blur effects](https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers)
- [CSS backdrop filtering and backdrop roots](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [CSS masking](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking)
