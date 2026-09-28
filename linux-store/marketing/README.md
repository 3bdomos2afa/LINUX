# LINUX — Social ad kit (Liquid Glass)

Ready-to-post Instagram / Facebook / TikTok creatives for linux-eg.com in Egyptian Arabic
and English, generated from HTML templates. Change the words in **one file**
(`copy.json`), run one command, and every PNG and story video is rebuilt.

[العربي تحت ↓](#عربي)

## What you get

| Output (`out/`) | Size | Use it for |
| --- | --- | --- |
| `feed-drop-ar.png` / `-en.png` | 1080×1350 (4:5) | Instagram & Facebook feed: new drop / hoodie product hero |
| `feed-studio-ar.png` / `-en.png` | 1080×1350 (4:5) | Feed: "Design your own" customize-studio promo |
| `story-code-ar.png` / `-en.png` | 1080×1920 (9:16) | Stories / TikTok: welcome code **LINUX10**, 10% off the first order |
| `story-delivery-ar.png` / `-en.png` | 1080×1920 (9:16) | Stories / TikTok: free delivery over LE 2,000 + pay on delivery, 14-day exchange |
| `carousel-cover-ar.png` / `-en.png` | 1080×1080 (square) | First slide of a carousel; follow it with product shots |
| `story-offer-ar.mp4` / `-en.mp4` | 1080×1920, 9 s, H.264 | Stories / Reels / TikTok video: welcome-code offer over the brand's embroidery footage |
| `story-offer-ar-cover.png` / `-en-cover.png` | 1080×1920 | Cover frame for Reels / TikTok (same design, static) |

## Re-render

Run from the repository root:

```sh
node linux-store/marketing/render.mjs                         # everything, Arabic + English (≈5 min; stills take ≈15 s)
node linux-store/marketing/render.mjs --no-video              # PNGs only
node linux-store/marketing/render.mjs --video-only            # story videos only
node linux-store/marketing/render.mjs --only story-code --lang ar
```

Needs Node 18+, the `agent-browser` CLI (the script always uses the browser session
`ads`; set `ADS_SESSION` to use another) and `ffmpeg` / `ffprobe` built with libx264.

The renderer checks its own work. It stops if a font or image fails to load, and it exits
with code 1 and a list of problems when text overflows its box, leaves the canvas, or
enters a story's unsafe zone. Headlines shrink automatically to fit first.

## Edit the copy — `copy.json`

- `shared`: website, discount code (`LINUX10`) and every image path (relative to `marketing/`).
- `ar` and `en`: one block per creative: `feed_drop`, `feed_studio`, `story_code`,
  `story_delivery`, `carousel_cover`, `video_offer`.
- `*word*` colours a word lime · `\n` forces a line break · `""` hides that element
  (for example `"price": ""`) · lists such as `chips`, `rows` and `cover_photos` can be shorter or longer.
- To swap a photo, put it in `assets/products/` and point `shared.images.*` at it. White-background
  studio shots work best: the templates multiply them onto cream cards, so the white disappears.
  Two close-up alternates are already there: `hoodie-sada-black-closeup.jpg` and `hoodie-sada-white-closeup.jpg`.

## Offers and facts used (all from the theme; verify before posting)

| On the creative | Source in the repo |
| --- | --- |
| Code **LINUX10** | `theme/templates/index.json`, marquee block `m1` (also the cart-drawer code chip default) |
| 10% off your first order | `home.newsletter_body`, `newsletter.footer_label` |
| Free delivery over LE 2,000 | `config/settings_data.json` → `free_shipping_threshold: 2000`; `home.marquee_1`, `cart.offer_bar` |
| Print from a single piece · embroidery from 10 pieces | `customize.print_note`, `customize.min_embroidery` with `min_embroidery: 10` in `index.customize.json` |
| Pay on delivery · 14-day exchange · 1–2 days Cairo, 2–4 rest of Egypt · 27 governorates · 340 gsm melton | `home.prop_*`, `home.marquee_*`, `home.about_stat_3_*` |
| Headlines and CTAs | `home.arrivals_*`, `home.customize_*`, `customize.subtitle`, `sections.hero.*`, `home.mega_promo`, `cart.free_shipping_unlocked`, `cart.discount_hint` |
| Hoodie Sada · LE 649 | Catalog snapshot `dev/data/product-hoodie-sada-*.json` (`price: 64900`) |

- The theme only **shows** `LINUX10`. Before posting, confirm that the code exists in
  Shopify → Discounts as 10% off the first order.
- The catalog snapshot also has a LE 800 compare-at price. The kit deliberately does not
  advertise it as a discount. Confirm the live price, or set `"price": ""`.

## Placements and safe zones

- **Instagram feed**: 4:5 portrait, 1080×1350 (the tallest feed format). **Carousels**: every slide
  takes the first slide's ratio, so start with the square cover and add square product slides.
- **Facebook feed**: 4:5 and square both work.
- **Stories / Reels (Instagram, Facebook) and TikTok**: 9:16, 1080×1920. Keep text out of the top
  ~250 px (profile row, progress bar) and the bottom ~340 px (reply bar, link sticker, TikTok
  caption). TikTok's action buttons also cover the right edge of the lower half, which is why the
  story layouts keep text centred. The renderer audits the 250 / 340 px lines.
- **Video**: H.264 High, yuv420p, 24 fps, `+faststart`, a silent AAC track (add music in the app),
  under 3 MB each. It opens on the embroidery footage, then the glass ticket, delivery chip and CTA
  slide in during the first 3 seconds.

## How it works

- `templates/kit.css` holds the Liquid Glass system: frosted and saturated glass with a specular rim,
  "smoke" glass for text over bright photos, capsule pills, the lime CTA and the dashed code capsule.
  `templates/kit.js` fills the copy, fits headlines and runs the layout audit.
- `render.mjs` injects `copy.json` into each template, opens it in `agent-browser`, waits for
  `document.fonts.ready` and the images, audits the layout and takes the screenshot.
- Video: each overlay layer is rendered twice, on black and on white, which gives an exact alpha
  channel. A second render of the glass shapes cuts out a blurred copy of the footage, so the glass
  really frosts the moving embroidery. ffmpeg then fades and slides the layers in, over a slow
  push-in on `theme/assets/hero-mobile.mp4`.
- `assets/products/*.jpg`: product photos downloaded from the store's Shopify CDN (the images of
  the products in `dev/data/`). `assets/embroidery-still.jpg` is a frame of `hero-mobile.mp4`.
  Mascots, hoodie mockups and the wordmark are read from `theme/assets/`.

**Add a creative:** copy a template (keep `<!-- kit:inject -->` and use `data-k="key"` for text),
add it to `STILLS` in `render.mjs`, and add matching `ar` / `en` blocks in `copy.json`.

## ⚠ Fonts and licences — before anything goes public

The templates load Thmanyah Sans, Froople and Mochi Tubby straight from `../theme/assets/`.
The font files are never copied into `marketing/`. The theme's release gate
(`linux-store/INSTALL.md`) still applies:

- **Mochi Tubby** is "Free for Personal Use".
- **Froople** was supplied without any licence text.
- **Thmanyah**'s licence covers commercial design work, but check that it covers paid advertising.

Mochi Tubby and Froople appear in every English creative. Clear the rights, or swap the fonts
in `kit.css` (`--head` / `--body`), before running ads.

---

<a id="عربي"></a>

<div dir="rtl">

# LINUX — مجموعة إعلانات السوشيال (ليكويد جلاس)

تصميمات جاهزة للنشر على إنستجرام وفيسبوك وتيك توك، بالعربي المصري والإنجليزي، ومعمولة من
قوالب HTML. عدّل الكلام في **ملف واحد** (`copy.json`)، وشغّل أمر واحد، وكل الصور والفيديوهات
هتتعمل من جديد.

## الملفات الجاهزة (في `out/`)

| الملف | المقاس | تستخدمه فين |
| --- | --- | --- |
| `feed-drop-ar.png` / `-en.png` | 1080×1350 (4:5) | بوست فيد: هودي جديد نازل |
| `feed-studio-ar.png` / `-en.png` | 1080×1350 (4:5) | بوست فيد: استوديو التصميم «صمّم قطعتك» |
| `story-code-ar.png` / `-en.png` | 1080×1920 (9:16) | ستوري وتيك توك: كود **LINUX10**، خصم ١٠٪ على أول طلب |
| `story-delivery-ar.png` / `-en.png` | 1080×1920 (9:16) | ستوري وتيك توك: توصيل مجاني فوق ٢٬٠٠٠ جنيه، والدفع عند الاستلام، والاستبدال خلال ١٤ يوم |
| `carousel-cover-ar.png` / `-en.png` | 1080×1080 (مربع) | أول صورة في الكاروسيل، وبعدها صور المنتجات |
| `story-offer-ar.mp4` / `-en.mp4` | 1080×1920، ٩ ثواني | فيديو ستوري وريلز وتيك توك بعرض الكود فوق فيديو التطريز بتاع البراند |
| `story-offer-ar-cover.png` / `-en-cover.png` | 1080×1920 | صورة غلاف للريلز والتيك توك |

## إزاي تعيد التصدير

من فولدر الريبو الرئيسي:

```sh
node linux-store/marketing/render.mjs                 # كله، عربي وإنجليزي (حوالي ٥ دقايق)
node linux-store/marketing/render.mjs --no-video      # الصور بس (حوالي ١٥ ثانية)
node linux-store/marketing/render.mjs --only story-code --lang ar
```

محتاج Node 18 أو أحدث، وأداة `agent-browser` (السكربت بيستخدم جلسة المتصفح `ads` دايمًا)،
و`ffmpeg` فيه libx264. السكربت بيراجع شغله بنفسه: لو خط أو صورة ما حمّلتش بيقف، ولو نص طلع
بره مكانه أو بره الصورة أو دخل المنطقة اللي بتغطيها واجهة الستوري، بيطبع قائمة بالمشاكل
ويخرج بكود 1. العناوين بتصغر لوحدها الأول عشان تكفي مكانها.

## تعديل الكلام — `copy.json`

- `shared`: الموقع والكود (`LINUX10`) ومسارات كل الصور (بالنسبة لفولدر `marketing/`).
- `ar` و`en`: جزء لكل تصميم: `feed_drop` و`feed_studio` و`story_code` و`story_delivery`
  و`carousel_cover` و`video_offer`.
- حط الكلمة بين نجمتين `*كلمة*` عشان تتلوّن أخضر ليموني · `\n` لسطر جديد · القيمة الفاضية `""`
  بتخفي العنصر (مثلاً `"price": ""`) · القوائم زي `chips` و`rows` ممكن تزوّد فيها أو تقلّل.
- عشان تغيّر صورة منتج، حطها في `assets/products/` وغيّر مسارها في `shared.images`. أفضل حاجة
  صور الاستوديو على خلفية بيضا، لأن الأبيض بيختفي على الكارت الكريمي.

## العروض المستخدمة (كلها من الثيم، راجعها قبل النشر)

- كود **LINUX10**: من `theme/templates/index.json` (بلوك الشريط `m1`)، والثيم بيعرضه بس.
  **لازم** تتأكد إن الكود متعمل في Shopify ← Discounts كخصم ١٠٪ على أول طلب.
- «خصم ١٠٪ على أول طلب»: من `home.newsletter_body`.
- «توصيل مجاني فوق ٢٬٠٠٠ جنيه»: من `free_shipping_threshold: 2000` في `settings_data.json`، ومن `home.marquee_1`.
- «طباعة من قطعة واحدة، تطريز من ١٠ قطع»: من `customize.print_note` و`customize.min_embroidery`.
- «الدفع عند الاستلام»، «استبدال خلال ١٤ يوم»، «بنوصّل لـ ٢٧ محافظة»، «ميلتون تقيل ٣٤٠ جرام»: من نصوص الصفحة الرئيسية.
- سعر «هودي سادة ٦٤٩ جنيه»: من نسخة الكتالوج في `dev/data`. أكّد السعر الحالي أو امسحه.
  ماعملناش إعلان خصم على سعر الـ ٨٠٠ جنيه القديم، لأنه مش موجود في نصوص الثيم.

## المقاسات ومناطق الأمان

- فيد إنستجرام: طولي 4:5 (1080×1350). الكاروسيل: كل الصور بتاخد نسبة أول صورة، فابدأ بالغلاف المربع.
- ستوري وريلز وتيك توك: 9:16 (1080×1920). خلي الكلام بعيد عن أعلى ~250 بكسل (اسم الحساب وشريط
  التقدّم) وعن أسفل ~340 بكسل (خانة الرد، واللينك، وكابشن تيك توك). أزرار تيك توك كمان بتغطي
  يمين النص اللي تحت، وعشان كده الكلام في الستوريز في النص.
- الفيديو: H.264، yuv420p، 24 فريم، أقل من ٣ ميجا، ومعاه تراك صوت صامت (ضيف المزيكا من التطبيق).

## ⚠ الخطوط والتراخيص — قبل أي نشر

القوالب بتقرا خطوط Thmanyah Sans وFroople وMochi Tubby من `../theme/assets/`، ومفيش أي ملف
خط اتنسخ جوه `marketing/`. نفس تحذير الثيم في `INSTALL.md` لسه قائم:

- **Mochi Tubby** رخصته للاستخدام الشخصي بس.
- **Froople** ما جاش معاه أي رخصة.
- رخصة **Thmanyah** بتسمح بالتصميم التجاري، بس اتأكد إنها بتغطي الإعلانات الممولة.

Mochi Tubby وFroople موجودين في كل التصميمات الإنجليزي. خلّص الحقوق، أو غيّر الخطوط من
`kit.css`، قبل ما تشغّل أي إعلان.

</div>
