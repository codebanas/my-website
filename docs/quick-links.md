# Quick-links final screen

The final screen is arranged from the bottom up: the artwork crop touches the
viewport bottom, the visible artwork begins 48px below the menu, and the menu
shows three 44px rows with 12px gaps. Menu position and artwork height share
the same CSS variables on `.quick-links-sticky-track`.

The desktop crop is 172px high, scaled to 65% on tablet and 45% on mobile.
Short viewports reduce the crop height first to preserve room below the header.
Dynamic viewport units keep the bottom alignment when mobile browser chrome
changes height. The 53px transparent SVG inset is removed from the artwork
groups when measuring the visible 48px gap.

The artwork reveals at the end of page scrolling. Further vertical wheel or
touch gestures anywhere on that screen scroll only the link window. Scrolling
up from Home returns to the page. Avoid positioning a cropped artwork layer
above the viewport bottom: that leaves the blank strip the design excludes.
