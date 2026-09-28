# LINUX Liquid Glass — Changelog

## 4.1.0 — Identity 2.0 · studio photos · new fonts · faster (2026-09-28)

**العربي أولاً 👇 / English below**

### اللي اتغيّر
**الهوية البصرية**
- **ألوان بإيقاع**: سكاشن «شيت» كريمي وليموني بين الأخضر الغامق (الأكثر مبيعاً كريمي، المميزات كريمي، النيوزليتر ليموني) — من إعداد **Colour** في كل سكشن.
- **موتيف التطريز**: شارات على شكل «باتش» متطرّز (جديد / خصم / خلصت)، أيقونات المميزات باتشات، وخط غُرز تحت كل عنوان بيتخيّط وانت نازل.
- **شرايط منسوجة** بدل الماركي: شريطين ليموني وكريمي مايلين عكس بعض (Marquee → Style).
- **فقاعات الأقسام** تحت الهيرو زي ستوريز إنستجرام (سكشن Category bubbles).
- **كروت المنتجات** على خلفية استوديو، زرار «+» للإضافة السريعة على الموبايل.
- **البطريق بيتحرك**، والمنتج بيطير للشنطة لما تضيفه، وكونفيتي لما التوصيل يبقى مجاني، وقلوب لما تحفظ.

**الصور والموكب**
- **٥٠ صورة استوديو** لكل المنتجات بخلفية واحدة وتكوين واحد ٤:٥ (+ نسخ غامقة + قص شفاف) في `photos/` — المنتج نفسه ما اتغيّرش.
- **موكب حقيقي** للاستوديو: وش الهودي بـ٤ ألوان على موديل، ضهر الهودي بـ٤ ألوان أوضح، وضهر التيشيرت أبيض/أسود.
- **صور أغلفة للمجموعات** (شتاء، صيف، تخصيص، الكل).

**الخطوط**: إعداد **Font style** — **Street** (الافتراضي: الإسكندرية + فسطاط للعربي، Unbounded + فسطاط للإنجليزي)، **Bubble**، أو **Classic**. الخطوط الجديدة مفتوحة الرخصة (OFL) فمشكلة الرخصة اتحلّت للإعداد الافتراضي.

**السرعة**: صورة الهيرو بتظهر الأول والفيديو بعد التحميل، ٣ ملفات CSS مش بتوقف العرض، كود المنتج بيتحمّل عند الحاجة، البطاريق بمقاس صغير، ٦ خطوط مش مستخدمة اتشالت، البلور مقصور على العناصر العايمة، الانكسار (refraction) بقى اختياري، والستارة مرة واحدة في الجلسة.

### English
**Identity** — cream/lime section sheets between forest bands (per-section *Colour* setting); embroidery motif (patch badges and value-prop icons, stitched heading rule that sews in on scroll); woven double ribbons replacing the ticker (fixes the RTL ticker scrolling out of view); category bubbles; studio-backdrop product cards with a phone "+" quick add; penguin idle motion; fly-to-bag, free-delivery confetti and wishlist heart burst.

**Photography** — 50 studio images (one backdrop, one 4:5 framing), dark variants and transparent cutouts in `photos/` (garments unaltered); real studio mockups: hoodie front ×4 colours, sharper hoodie back ×4, tee back white/black, wired through the existing *Built-in mockup photos* setting; collection cover art. The local preview shows the set via `photos/manifest.json` (`LINUX_PHOTOS=0` shows the original catalog).

**Fonts** — *Font style* preset: Street (default: Alexandria + Fustat / Unbounded + Fustat), Bubble (Baloo Bhaijaan 2 + Bagel Fat One) or Classic. OFL, split Arabic/Latin WOFF2 with `unicode-range`, unhinted (the original hinting dropped the dots of a final ي at some sizes). Home-page font bytes: Arabic 228 → 130 KB, English 206 → 81 KB.

**Performance** — hero poster is a real `<picture>` (portrait 540×960 on phones) and the video starts after `load`; motion/offers/number-input CSS no longer block rendering; the product script loads on demand outside product pages; 320 px mascot variants; unused fonts removed; backdrop blur only on floating chrome; refraction off by default; the brand curtain shows once per session and no longer shifts the layout (CLS 0.049 → 0).

**Tooling** — preview harness gzips responses and resizes `photos/` images like Shopify's CDN; typography check reads the active preset and each section's colours; font tests cover all presets.

## 4.0.0 — Liquid Glass 2 · offers · notifications (2026-09-28)

**العربي أولاً 👇 / English below**

### اللي اتغيّر

**الزجاج والشفافية والحركة**
- **Liquid Glass 2**: خامة زجاج من ٥ طبقات (عدسة، تينت، لمعة، حافة ضوء، عمق). على كروم/أندرويد الهيدر والتاب بار بيعملوا **انكسار حقيقي** للصفحة عند الحواف زي زجاج iOS 26؛ باقي المتصفحات بتاخد زجاج مطفي بنفس الشكل.
- إعدادين جداد في **Theme settings → Appearance**: *Glass tint* (قد إيه الزجاج شفاف) و*Liquid refraction* (مطفي / خفيف / قوي).
- **تأثير حافة الاسكرول**: المحتوى بيتنعّم وهو داخل تحت الهيدر والتاب بار.
- **انتقالات بين الصفحات** (View Transitions): الهيدر والتاب بار ثابتين والصفحة بتتبدّل بنعومة. بتتقفل تلقائياً مع "تقليل الحركة".
- لو العميل مفعّل "تقليل الشفافية" من جهازه، الزجاج بيبقى مصمت ومقروء.

**الأيقونات والتاب بار**
- 22 أيقونة جديدة بنفس الخط (رئيسية، عروض، تذكرة كود، إشعار، كاش، محفظة، كارت، دعم، استبدال، صوت…) + نسخ مليانة للتاب النشط.
- **تاب بار iOS 26**: عدسة زجاج بتتحرك تحت التاب اللي بتدوس عليه، أيقونة مليانة للصفحة الحالية، النجمة الليموني للتخصيص واسمها تحتها ("صمّم") من غير ما يتقص، وبينكمش شوية وانت نازل.
- كل أسهم الموقع بقت بتتقلب صح في العربي من مكان واحد.

**العروض والإعلانات**
- **شريط الإعلانات v2**: رسايل متغيّرة (بلوكات من الهيدر) بأيقونة ولينك وكود بيتنسخ بلمسة، وعدّاد اختياري لموعد حقيقي. بيقف لما تقف عليه، وبيتسحب بالصباع على الموبايل.
- سكشن **Offer spotlight**: كارت زجاج كبير للعرض — صورة/منتج/البطريق، كود بيتنسخ، عدّاد أيام/ساعات/دقايق، وزرار. بيختفي لوحده بعد نهاية العرض.
- **Promo popup**: نافذة ترحيب (bottom sheet على الموبايل) بالكود وتسجيل النيوزليتر. بتفتح بعد ثواني أو لما العميل يخرج، مرة كل كام يوم، ومش بتظهر في الشنطة أو صفحة التخصيص.
- **Video reels**: ريلز 9:16 بتشتغل صامتة لما تبان بس، زرار صوت، ومنتج تحت كل ريل. ارفع فيديوهاتك من محرر الثيم.
- **عرض الباندل** بقى صادق مع العميل: في إعداد *Matching automatic discount is live*؛ طول ما هو مطفي الأسعار مكتوب إنها تقديرية والسعر النهائي في الشنطة — من غير تعليمات للأدمن قدام العميل.

**الإشعارات**
- إشعارات على شكل **Dynamic Island**: كبسولة بتنزل من فوق فيها صورة المنتج وزرار "شوف الشنطة"، بتتقفل بسحبة لفوق، وبتقف لما تلمسها.
- **بلّغني لما يرجع**: على أي مقاس خلصان، العميل يسيب إيميله والطلب بيوصلك على إيميل المتجر فيه المنتج والمقاس واللينك (من غير أي تطبيق).
- **قوالب إيميلات Shopify** بالعربي والإنجليزي (تأكيد الطلب، الشحن، التوصيل، الإلغاء، السلة المتروكة، الحساب…) في `notifications/` — انظر `notifications/README.md`.

**الصور والفيديو**
- بوستر الهيرو اتحوّل من PNG ‏1.97 ميجا لـ WebP ‏108 كيلو (−94%).
- زرار **إيقاف/تشغيل الفيديو** في شريط الثقة تحت الفيديو (مش فوقه)، والفيديو مش بيشتغل لوحده لو العميل مفعّل تقليل الحركة.
- **كيت إعلانات السوشيال** (بوست/ستوري/فيديو ستوري بالعربي والإنجليزي) في `marketing/` — انظر `marketing/README.md`.

**الصفحات والتجربة**
- الرئيسية بقت: إعلانات ← هيرو ← ماركي ← العرض ← الأكثر مبيعاً ← المجموعات ← الريلز ← مميزاتنا ← النيوزليتر.
- **شارات الدفع المحلية** (الدفع عند الاستلام، إنستاباي، المحافظ، فوري، valU) في الفوتر وتحت زرار الدفع — من **Theme settings → Payments**.
- قالب **page.faq** للأسئلة الشائعة بالعربي والإنجليزي.
- إصلاحات: لينكات "المحفوظات" كانت بتفتح 404 — اتصلحت؛ التقييم الوهمي "٤٫٩ · ١٢٠ تقييم" اتشال (بيظهر بس من تطبيق تقييمات حقيقي)؛ زرار الهيرو مش بيتكسر لسطرين؛ أسامي المجموعات مش بتتقص؛ الشنطة الفاضية من غير ملخص؛ عنوان صفحة التخصيص؛ فقاعة الواتساب فوق التاب بار؛ مساحات لمس أكبر.

**التعريب**
- كل النصوص الجديدة بالعربي المصري، وتحسين ~٣٠ جملة (كمّل اللوك، خلصت، الإيميل، كلمة السر، سياسة الاسترجاع…)، وعلامة ٪ عربي جنب الأرقام العربي.

### English

**Glass, transparency, motion** — Liquid Glass 2 five-layer material; real edge refraction on the header and tab bar in Chromium (Chrome/Android/Edge/Samsung) via per-surface SVG displacement maps, frosted fallback elsewhere; *Glass tint* and *Liquid refraction* theme settings; iOS 26 scroll-edge effect; cross-document view transitions; `prefers-reduced-transparency` / `prefers-reduced-motion` respected.

**Icons & tab bar** — 22 new icons + filled active variants; iOS 26 tab bar with a sliding glass lens, filled active glyphs, the lime Customize star with a short label, tuck-on-scroll; one global RTL mirroring rule (CSS `scale`, so hover transforms keep working).

**Offers & ads** — rotating announcement bar (blocks, icons, links, tap-to-copy code, optional real countdown); *Offer spotlight* section (code, days/hours/min/sec countdown, auto-hide after the end); *Promo popup* on native `<dialog>` (delay / exit intent, frequency cap, newsletter via the customer form, never on bag/studio); *Video reels* (shoppable 9:16 clips, play only on screen); honest bundle copy behind a *discount is live* switch.

**Notifications** — Dynamic-Island toasts (thumbnail, action, swipe-up dismiss, pause on touch); back-in-stock requests through the contact form; bilingual Shopify email templates (`notifications/`).

**Media** — hero poster PNG 1.97 MB → WebP 108 KB; hero pause/play in the trust row (never on the footage) and no autoplay under reduced motion; social ad kit (`marketing/`).

**Pages & UX** — richer home composition; local payment badges (Theme settings → Payments); `page.faq` template; fixes for the 404ing Saved links, the fake static rating, the wrapping hero CTA, truncated collection names, the empty-bag summary, the Customize page title, the WhatsApp bubble over the tab bar, duplicate free-shipping copy in the bag, the marquee's hidden focusable buttons, and small tap targets.

**Localization** — all new strings in Egyptian Arabic, ~30 copy refinements, Arabic percent sign beside Arabic digits.

**Tooling** — `dev/template-settings.test.mjs` fails when a JSON template or section group stores a setting or block the section schema doesn't define; the local emulator draws realistic Visa/Mastercard marks; the setup script provisions the pinned Ruby via mise.
