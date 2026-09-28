# Customize-studio mockups — sources and licences

The 16 garment mockups in `theme/assets/cz-{hoodie,tee}-{front,back}-{black,white,burgundy,beige}.webp`
are derived from four free stock photos of blank white oversized garments.

| Mockup | Source photo | Author | Licence |
|---|---|---|---|
| Hoodie front | Pexels photo 8217400 — https://www.pexels.com/photo/8217400/ (download: https://images.pexels.com/photos/8217400/pexels-photo-8217400.jpeg) | MART PRODUCTION* | Pexels License — https://www.pexels.com/license/ |
| Hoodie back | Pexels photo 8217415 — https://www.pexels.com/photo/8217415/ (download: https://images.pexels.com/photos/8217415/pexels-photo-8217415.jpeg) | MART PRODUCTION* | Pexels License — https://www.pexels.com/license/ |
| Tee front | Unsplash photo HCiYNVJWMBo — https://unsplash.com/photos/HCiYNVJWMBo | engin akyurt (@enginakyurt) | Unsplash License — https://unsplash.com/license |
| Tee back | Unsplash photo YxNVXfyicSc — https://unsplash.com/photos/YxNVXfyicSc | engin akyurt (@enginakyurt) | Unsplash License — https://unsplash.com/license |

\* Both hoodie photos belong to MART PRODUCTION's "man in white hoodie" studio series on Pexels
(published June 2021; sibling photos of the same shoot, e.g. https://www.pexels.com/photo/a-man-in-white-hoodie-standing-8217518/,
are credited to MART PRODUCTION). The individual pages for 8217400/8217415 were behind a bot check during verification,
so the credit is taken from the series. Every photo on Pexels is under the Pexels License.

Neither licence requires attribution; credit is given here anyway. Both allow commercial use and modification;
neither allows selling the unmodified photos or redistributing them as stock/wallpaper — these files are heavily
edited derivatives (model removed) used only as studio previews in this store's theme.

## What was changed
1. Background removal (rembg, `birefnet-general-lite`), then a garment-only mask: light, neutral fabric kept;
   skin, hair and denim removed (CIELAB chroma/lightness thresholds + morphology).
2. Ghost-mannequin finish: the face inside the hood and the front neckline are filled with an inner-fabric
   shadow; tee silhouettes rebuilt where hands and hair covered the fabric (clean half mirrored for the
   shoulders/sleeves, straight side seams, symmetric hem; covered fabric repainted with OpenCV inpainting).
3. Recolouring from a luminance shading map of the white garment, in linear light, with per-colour fold
   contrast. Target colours sampled from the brand's own photos (`photos/products/hoodie-sada-*/01.webp`):
   black `#1c1c1e` (photo median `#111111`, lifted so folds stay visible), white `#f3f3f1`,
   burgundy `#5a1a20` (median `#4e161b`), beige `#cdbfa6`.
4. Framed on a 1200×1200 transparent canvas: the hoodie spans 93% of the height (top at 3.5%), the tee 90%
   (top at 5%). The Customize section's print areas (`area` in `sections/main-customize.liquid`) match this framing.

Rebuild scripts are kept outside the theme; the previous mockups (built from the brand's own photos) are in git history.
