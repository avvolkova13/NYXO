# NYXO — Vertical index thumbnail

## Scope

Change only the small rifle thumbnail inside the bottom-left “Характеристики предмета” scanner. Do not change the central 3D rifle, Hero composition, callouts, or scanner effects.

## Visual behavior

- Rotate the thumbnail artwork by 90 degrees so the rifle reads vertically.
- Fit the complete rifle silhouette inside the existing scanner frame without cropping.
- Keep the current frame, scan line, markers, colors, and animation unchanged.
- Preserve the existing responsive dimensions of the characteristics block.

## Success criteria

- The rifle is fully visible in the thumbnail at desktop and mobile breakpoints.
- No part of the weapon touches or crosses the thumbnail frame.
- The central 3D presentation remains unchanged.

## Verification

- Add or update a focused component/style test for the thumbnail orientation contract.
- Visually verify desktop and mobile renders.
- Run the complete test suite, typecheck, and production build.
