# LINUX Liquid Glass — Changelog

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
