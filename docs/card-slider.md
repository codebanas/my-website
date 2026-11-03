# Card slider

The demo has 21 cards, preserving the existing seven-color order across three
cycles. Cards stay 272px by 332px, upright, with 16px gaps and an 8px hover lift.

The slider uses the same responsive outer gutter as the navigation: 16px on
mobile, 32px on tablet, and 64px on desktop. Track padding adds only vertical
hover clearance, so the true first and last card edges match those gutters.

When visible, the cards drift left at 24 CSS pixels per second. Hover pauses
temporarily. Wheel input, page scrolling, clicking, pointer presses, or keyboard
navigation stop autoplay for the visit; manual dragging and swiping remain
available. Stopping holds the current position without a snap jump. The strip
stops at its last card without wrapping back to the beginning.

Autoplay pauses offscreen and in hidden tabs, and respects reduced-motion
preferences. Existing shuffle, favorites grouping, centering, artwork, and
responsive fade treatments remain in place.
