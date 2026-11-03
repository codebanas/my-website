# Progressive fades

`ProgressiveFade` renders decorative overlays without applying filters or masks
to the content container. Eight masked backdrop-filter bands approximate a
progressive blur from 16px at the outer edge to clear at the inner edge. Both
standard and WebKit-prefixed mask/backdrop-filter properties are supplied.

The top overlay stays fixed at 160px high with six darkening gradient layers.
The slider overlays mirror each other and use two darkening gradient layers
each at one-third tint opacity (33.33%). Their blur tapers
from a softer 10px at the outer edge to clear, while the inner edge stays fully
transparent.
They are centered vertically over the slider at 264.88px wide by 430px high. This
matches the visible footprint of the 430px by 264.88px Figma layer rotated 90
degrees. Their height extends beyond the cards to cover the whole outer card;
the toolbar sits above the overlays so its text and buttons stay crisp. On
mobile and tablet screens below 1024px, each side fade is 32px wide, with a
gentler maximum blur of 4px and tint opacity of 26.67% (one third of 80%). These overrides are scoped
to the slider fades. An eased tint curve and the blur masks both reach zero
opacity by 80% of each side overlay, leaving its final 20% fully transparent.
This clear buffer avoids ending the effect against the rectangular layer edge.
Overlay pointer events are disabled so the slider controls remain usable.

The card slider spans the full viewport width, including the side overlays.
Only the hero and gallery toolbar use the centered 1393px content container.
The slider therefore reveals the partial outer cards beyond the toolbar edges,
and the side fades end at the screen edges rather than at the content container.

This is a browser approximation of Figma's progressive blur, rather than a
native variable-radius CSS filter. If backdrop filtering is unsupported, the
darkening gradients remain visible.

References:

- [Figma blur effects](https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers)
- [CSS backdrop filtering and backdrop roots](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [CSS masking](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking)
