# Card slider

The demo has 21 cards, preserving the existing seven-color order across three
cycles. Cards stay 272px by 332px, upright, with 16px gaps and an 8px hover lift.

The slider spans the screen again, with the original side fade exports anchored
at the screen edges. The toolbar sits 32px above the resting cards; the hero and
toolbar retain their original container and vertical spacing.

When visible, the cards drift left at 24 CSS pixels per second. Hover pauses
temporarily. Wheel input, page scrolling, clicking, pointer presses, or keyboard
navigation stop autoplay for the visit; manual dragging and swiping remain
available. Stopping holds the current position without a snap jump. The strip
loops without a visible reset in either direction. Three matching runs keep
cards ready beyond both screen edges. Crossing a run boundary shifts the scroll
offset by one complete run, preserving the card positions, 16px gaps, texture
choices, and repeating color order. Dragging adjusts its starting offset during
that shift so it continues naturally across the boundary.

Autoplay pauses offscreen and in hidden tabs, and respects reduced-motion
preferences. Existing shuffle, favorites grouping, centering, artwork, and
responsive fade treatments remain in place. Decorative repeat runs are hidden
from screen readers and keyboard tabbing; their pointer-clickable hearts share
the same saved state as the main run. Every heading has a unique DOM ID.
