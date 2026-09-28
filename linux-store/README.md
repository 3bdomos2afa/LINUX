# LINUX — Liquid Glass Shopify theme

Custom Shopify Online Store 2.0 theme for [linux-eg.com](https://linux-eg.com), built in
the Apple iOS 26 "Liquid Glass" language: fully rounded glass panes, the LINUX
forest/cream/lime palette, the penguin mascot woven through the pages, and a
macro embroidery video as the hero. English + Egyptian Arabic (RTL).

**Release status:** every default font (Rakkas + Alan Sans for Arabic, Unbounded + Fustat for English, Badeen Display accent) is SIL OFL (see *Typography* below); only the optional Thmanyah / Froople / Mochi choices, marked “licence needed”, still need written permission. Local checks are not a live Shopify import or checkout test. See [INSTALL.md](INSTALL.md).

```
linux-store/
├── theme/   ← the Shopify theme (upload this)
├── dist/    ← packaged zip (node dev/package.mjs)
└── dev/     ← local preview harness + checks (not part of the theme)
```

## Build and install on Shopify

### Build the theme (maintainers)

For repository setup, the root `mise.toml` pins Ruby 3.3.12. With `mise`
installed, run these commands from the repository root; no `sudo` or `apt`
install is needed:

```sh
mise install
npm ci --prefix linux-store/dev
gem install liquid --version 5.8.7 --no-document
npm run package --prefix linux-store/dev
```

Packaging always runs theme-check and the Ruby Shopify-importer validation. If
Ruby/Liquid is missing or the importer reports a finding, packaging fails rather
than silently skipping import validation. The theme zip is written to
`linux-store/dist/linux-liquid-glass-theme.zip`.

### Upload the theme

1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
2. **Customize** the new theme (it stays unpublished until you click Publish):
   - **Theme settings → Appearance**: colours, glass strength, corner radius
     and motion are already tuned. Brand fonts stay enabled automatically;
     adjust **Text size** and **Headline size** if needed.
   - **Theme settings → Brand & social**: WhatsApp and social URLs.
     **Cart & checkout** controls the free-shipping threshold (LE);
     **Product page** controls delivery estimates.
   - **Header**: the menu uses your existing `main-menu`; the mega-menu images
     come from the collections' own images.
   - **Home**: every section is a block you can reorder. Pick the collections
     for *Most wanted* / *Shop by drop* / *Fresh off the machine*, and place
     the two *Shop the look* hotspots on your photo.
   - **Customize studio**: the navigation opens `/?view=customize` (localized
     in Arabic), using **index.customize**. Open that alternate template in the
     theme editor and select the store's hoodie and tee in the
     `product` (hoodie) and `tee_product` (tee) pickers. The studio
     uses the mapped Color, Size and Type options; see the setup notes
     below and [INSTALL.md](INSTALL.md) before publishing. An optional
     `/pages/customize` page uses **page.customize**; its settings are separate
     and must also be configured if you expose that page.
3. Languages: **Settings → Languages → Add Arabic → Publish**. The theme's
   Arabic locale covers theme-owned UI and the storefront flips to RTL. The
   Product-title fallback maps only known words; unknown words stay as written.
   Arabic SEO titles have localized fallbacks for the home page and known
   page and known product titles. Arbitrary merchant-authored article copy and other
   custom copy still need Shopify's **Translate & Adapt**; the theme does not
   translate all store copy automatically.
4. Publish only after font-rights clearance, store setup and live-preview checks.

## Customize studio configuration

- **Products and variants**: `product` selects the hoodie and
  `tee_product` selects the tee. The shipped page settings point the hoodie
  picker at `hoodie-customize` and leave the tee picker unset; choose the live
  hoodie and tee in those fields. Option names default to **Color**,
  **Type** and **Size**, with method values **Print** and **Embroidery**. The
  studio matches an actual available variant and does not silently fall back to
  another size or variant. `size_as_property` is off by default; enable it only
  when a made-to-order size should be stored as an order property instead of a
  native Shopify size variant.
- **Oversized fit**: both garments are described as oversized. Use the store's
  verified garment measurements in its size guide; the theme does not invent
  measurements or guarantee a size from height/weight. Each ordered piece keeps
  its own size when quantity changes.
- **Garment photos**: four shared image pickers set the hoodie front/back and
  tee front/back. Each garment-colour block can override all four views. The
  priority is per-colour upload, shared upload, built-in mockup, then the drawn
  fallback. Clear a colour override to use a new shared image. Use square images
  with matching crops; uploaded photos keep their real colours. The built-in
  mockups (4.2) are ghost-mannequin oversized hoodie and tee, front and back, in
  black, white, burgundy and beige (16 files, from Pexels/Unsplash stock — see
  `licenses/mockups/SOURCES.md`). The print areas in the section's `area` JSON
  match their framing; replace the mockups only with images framed the same way.
  The tee appears once *T-shirt customization product* is set.
- **Studio tools (4.2)**: text designs (typed words become a transparent PNG in the
  brand fonts), placement presets (chest, pocket, full front / upper, centre, full
  back), a print-quality check (DPI at the real print width set per garment/side)
  and a sticky total + add-to-bag bar on phones — each switchable in the section.
- **Quantity pricing**: the `volume_pricing_enabled` switch is off by default. Add
  `price_tier` blocks only for real rates: `quantity` is the minimum
  piece count; the discount percentage field defaults to `0`.
  Displayed totals are estimates, not checkout discounts. Configure matching
  Shopify automatic discounts yourself. The estimate can read per-variant
  `quantity_price_breaks` when Shopify exposes them, but this does not
  mean the studio enforces Shopify B2B quantity-rule minimums, increments or
  maximums. The checked-in preview catalog currently has default quantity rules
  (minimum 1, no maximum, increment 1) and no price-break tiers. The live Shopify
  cart and checkout remain authoritative.
- **Order details and touch**: front/back artwork, generated mockups and each
  side's placement metadata are line-item properties. Each piece keeps its
  selected size; pieces with the same variant and size are grouped into one
  order line with `Size` and a `Piece` list. Outside Edit/Move design, the canvas
  declares CSS `touch-action: pan-y pinch-zoom`; Edit/Move enables dragging.
  Node tests verify there is no wheel-event hijack, but the local emulator does
  not establish touch behavior on a physical phone.

## What's inside

| Area | Notes |
| --- | --- |
| `assets/glass.css` | Design tokens and the **Liquid Glass 2** material (lens · tint · sheen · rim · depth; regular / clear / solid / tinted), scroll-edge effect, view transitions, RTL mirroring, buttons, pills, forms |
| `assets/glass.js` | Per-surface **refraction** maps for `[data-lens]` (Chromium only), tab-bar lens, header/tab-bar scroll states, announcement rotator, hero pause, reveal |
| `assets/section-promo.css` + `promo.js` | Offer spotlight, video reels, promo popup (loaded only by those sections) |
| Typography | Theme settings → **Typography**: Arabic headings / text, English headings / text and an accent font, chosen independently (defaults Rakkas + Alan Sans, Unbounded + Fustat, Badeen Display). Split Arabic/Latin WOFF2 with `unicode-range`; wired in `snippets/fonts.liquid` + `snippets/font-family.liquid` |
| `assets/components.css` | Header + mega menu, hero, marquee, cards, rails, bento, drawers, footer, search, tab bar, toasts |
| `assets/*.js` | Vanilla, dependency-free: AJAX cart + section rendering, predictive search (with Arabic term mapping), wishlist (localStorage), product variants/gallery/sticky ATC/quick view, Customize studio |
| `sections/` | 40 sections incl. all `main-*` templates, hero video, rotating announcement bar (header), **offer spotlight**, **video reels**, **promo popup**, bento collections, campaign, shop-the-look hotspots, testimonials, FAQ, newsletter, penguin row |
| `templates/` | JSON templates for every Shopify template type, plus `password` and `gift_card` |
| `locales/` | `en.default.json`, `ar.json` (Egyptian tone) |
| Hero video | `hero-1080.mp4` (~1 MB, desktop) / `hero-720.mp4` (tablet) / `hero-mobile.mp4` (540×960 portrait crop, ~220 KB) + poster — the browser picks one via `<source media>`; cut from the brand's own embroidery footage with a seamless loop |

**Typography (4.2)** — Theme settings → **Typography**: one font per role and language:
- **Arabic headings**: **Rakkas** — drawn from the Ruqaa lettering of 1950s–60s Egyptian film posters (default). Alternatives: **Alyamama** (modern Naskh, close to the Thmanyah feel), Alexandria, Baloo Bhaijaan 2, Badeen Display.
- **Arabic text**: **Alan Sans** (default) — legible down to 14 px. Alternatives: Fustat, Alyamama, Baloo Bhaijaan 2.
- **English**: **Unbounded** headings and **Fustat** text, as before (alternatives: Bagel Fat One, Rakkas, Alexandria / Alan Sans, Baloo).
- **Accent**: **Badeen Display** for stickers, seasonal badges and the Studio's “Fun” text style. Its digits are Latin-shaped, so digits and separators automatically come from the next font in the stack.
- The previous Thmanyah / Froople / Mochi fonts remain as choices marked “licence needed”.

All of these (defaults and alternatives) are **SIL Open Font License 1.1** fonts from the official Google Fonts repository (licences and pinned source commits in `licenses/fonts/`), cleared for your store, for self-hosting and for redistribution with the theme. Each family ships as an Arabic and a Latin WOFF2 with `unicode-range`, and a page preloads only its own language's files (the two default Arabic files: Rakkas ≈ 20 KB + Alan Sans ≈ 25 KB). The subsets are unhinted on purpose (the original Alexandria hinting hides the dots of a final ي), and the final-ي dots were checked in every weight. Rendering was checked in Chrome only; Safari and Windows are not checked yet.

The previous fonts are still not cleared: the Mochi archive says *Free for Personal Use* and its name table reads “All rights reserved”, the Froople archive has no licence text, and the Thmanyah licence restricts hosting the font files for web embedding (it also lacks the Arabic thousands separator ٬). Choose them only with written permission.

## Local preview (no Shopify account needed)

```
npm run start --prefix linux-store/dev   # http://localhost:3000
```

`dev/server.mjs` is a LiquidJS-based emulation of Shopify's Liquid objects,
`{% form %}`/`{% paginate %}`/`{% section %}` tags, ~60 filters, the AJAX Cart
and Section Rendering APIs and predictive search, seeded with a snapshot of the
live catalog (`dev/data/*.json`). It is a best-effort stand-in: always sanity
check on a real Shopify preview theme before publishing.

- `/ar/...` renders the Arabic/RTL storefront.
- `/__device?a=/&b=/products/x&c=/collections/y` shows three phone frames;
  add `&desktop=1` for a 1280px frame.
- `npm run check --prefix linux-store/dev` runs Shopify theme-check.
- `npm test --prefix linux-store/dev` runs the Node commerce, localization and UI regression tests.
- `npm run check:import --prefix linux-store/dev` runs the required Ruby importer check directly.
- With `agent-browser` already on an open storefront route, run
  `agent-browser eval "$(cat linux-store/dev/scripts/verify-typography.js)"`.
  It checks loaded fonts, heading/body colors, Arabic digit font, RTL and
  horizontal overflow. Run it on an English route and an `/ar/...` route.
- The importer check catches strict Liquid-tokenizer, section-schema and template-resource-setting issues that theme-check alone may miss. Packaging always runs it and fails if Ruby/Liquid or a clean result is unavailable. Install the pinned Ruby with `mise install` and Liquid with `gem install liquid --version 5.8.7 --no-document`; no system Ruby, `apt` or `sudo` is required.
