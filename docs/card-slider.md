# Card slider

The demo has 21 cards, preserving the existing seven-color order across three
cycles. Cards stay 272px by 332px, upright, with 16px gaps and an 8px hover lift.

The slider spans the screen again, with the original side fade exports anchored
at the screen edges. The toolbar sits 32px above the resting cards; the hero and
toolbar retain their original container and vertical spacing.

When visible, the cards drift left at 24 CSS pixels per second. Hover pauses
until the pointer leaves. Wheel input, clicking, pointer presses, and keyboard
navigation inside the gallery parent (cards and toolbar), plus manual slider
scrolling, pause temporarily. Autoplay resumes
after 1.2 seconds without interaction, once no pointer is held, hover has ended,
and keyboard focus has left the gallery. Pointer-click focus alone does not
leave it paused. Horizontal touch momentum extends the idle delay until scrolling
settles. Manual dragging and swiping remain available, and resuming holds the
current position without a snap jump or catch-up movement. The strip
loops without a visible reset in either direction. Three matching runs keep
cards ready beyond both screen edges. Crossing a run boundary shifts the scroll
offset by one complete run, preserving the card positions, 16px gaps, texture
choices, and repeating color order. Dragging adjusts its starting offset during
that shift so it continues naturally across the boundary.

Interactions outside the gallery parent do not pause autoplay or extend an
existing pause. This includes page scrolling, quick links, and the navigation.
A drag started inside the gallery remains paused until its pointer is released,
even outside the gallery. This behavior is shared across desktop, tablet, and mobile.

Autoplay pauses offscreen and in hidden tabs, and respects reduced-motion
preferences. Existing shuffle, favorites grouping, centering, artwork, and
responsive fade treatments remain in place. Decorative repeat runs are hidden
from screen readers and keyboard tabbing; their pointer-clickable hearts share
the same saved state as the main run. Every heading has a unique DOM ID.

Pointer heart clicks do not retain focus on the button while favorites reorder;
keyboard activation keeps focus. This prevents pointer-driven focus scrolling
when removing a saved card from the centered group.
