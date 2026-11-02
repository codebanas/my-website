# Progressive fades

`ProgressiveFade` renders decorative overlays without applying filters or masks
to the content container. Eight masked backdrop-filter bands approximate a
progressive blur from 16px at the outer edge to clear at the inner edge. Both
standard and WebKit-prefixed mask/backdrop-filter properties are supplied.

The top overlay stays fixed at 160px high with six darkening gradient layers.
The slider overlays mirror each other, use two darkening gradient layers each,
and are centered vertically over the slider at 384px wide by 256px high. On
narrow screens their widths are capped at 40% of the slider to retain a clear
center. Their gradients and blur masks reach zero opacity at the inner edge.
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
