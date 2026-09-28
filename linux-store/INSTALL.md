# LINUX — Liquid Glass theme · التركيب

**العربي تحت 👇 / English first**

## English

**Fonts are cleared for the default presets.** Street and Bubble use SIL OFL fonts; only the optional Classic preset (Thmanyah / Froople / Mochi) still needs written permission. Passing the local checks is not proof of a successful Shopify import, live file upload or checkout. Keep the theme unpublished while completing the store configuration and live-preview checks below.

**What's in this folder**
- `linux-liquid-glass-theme.zip` — the Shopify theme. This is the only file you upload.
- `hero-video/` — the three hero cuts the theme ships (1600×900 desktop ~1 MB, 720p tablet ~0.6 MB, 540×960 portrait phone ~0.3 MB) + poster, in case you want to re-use them elsewhere. They are already inside the theme.
- `brand-assets/` — penguin mascots, wordmark, favicons, editorial images used by the theme.
- `LINUX-product-photos.zip` (next to the delivery zip) — the new studio product photos (one backdrop, 4:5), dark variants, transparent cutouts and collection covers. Upload `01.webp`, `02.webp`… to each product in order; see `photos/README.md` inside.
- `licenses/fonts/` — SIL OFL licences of the default fonts.

**Install (5 minutes)**
1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file** → pick `linux-liquid-glass-theme.zip`.
2. Click **Customize** on the new theme (it stays unpublished until you press Publish).
3. **Theme settings → Brand & social**: WhatsApp and social links. **Cart & checkout**: free-shipping threshold (LE). **Product page**: delivery estimates.
4. **Home page**: every section is a block — reorder or hide. Pick your collections
   for *Most wanted* / *Shop by drop* / *Fresh off the machine*. For text fields
   wired to a theme translation, a blank field shows the built-in copy for the
   selected language; text you enter is shown as written.
5. **Customize studio**: navigation opens `/?view=customize` (Arabic: `/ar?view=customize`), using **index.customize**. Open that alternate template in the theme editor and select the real hoodie in `product` and the tee in `tee_product`. No Shopify Page is required for this route. If you also create `/pages/customize` with **page.customize**, configure its studio separately: changing one template does not change the other.
6. **Arabic**: Settings → Languages → **Add language → Arabic → Publish**.
   Theme-owned UI strings are in `theme/locales/ar.json`, and the storefront
   flips to RTL. The product-title fallback maps only known words (hoodie → هودي,
   black → أسود); unknown words stay as written. This is not an automatic
   translation of store copy: use Shopify **Translate & Adapt** for
   merchant-authored product titles and descriptions, pages, blog posts and
   policies.
7. **Publish only after** clearing font rights, checking store settings and completing a real Shopify preview test.

**Live-preview checklist**: verify both selected products and their available
Color × Size × Type combinations; leave tee customization disabled until its
product is selected. Add several independently sized pieces with front/back
artwork, open every original-file and mockup link in the resulting order, and
check placement metadata. Test interrupted additions and retries, then confirm
the actual cart and checkout totals, discounts and shipping eligibility. File
uploads are sent sequentially per variant/size group; local success does not
establish Shopify's upload persistence. Test touch scrolling on a physical phone.

**Campaign countdown**: Home → Hero → **Offer countdown** → **Campaign end
timestamp**. Enter the actual offer expiry with a timezone, in
`YYYY-MM-DDTHH:mm:ss+03:00` or UTC `YYYY-MM-DDTHH:mm:ssZ` format. Blank or invalid
values hide the clock; expiry shows an ended status rather than restarting it.
Configure the matching expiry in Shopify Discounts: the clock does not enforce it.

**Oversized fit**: hoodie and tee are oversized. Populate the size guide with
verified garment measurements, not invented measurements or a guaranteed
height/weight recommendation. Each piece keeps its own chosen size.

**Product-page bundle offer**: this separate block displays quantity choices and estimated prices; it does not set checkout prices. Configure only rates you actually intend to offer, with matching Shopify automatic discounts, and verify them on a live preview. Displayed defaults are not applied discounts.

**Find your size**: a block on the product page. It suggests a size from height/weight with a visible "rough guide" disclaimer. Turn it off by removing the block.

**Discount code in the cart**: integrates with Shopify's Cart API. Codes must exist in Discounts; verify their eligibility, combination rules and actual totals in the live preview. Local fixture codes are not evidence that those codes exist in your store.

**Customize studio — item variants**: the shipped page data points `product` at `hoodie-customize` but leaves `tee_product` unset; choose the actual hoodie and tee in those two pickers. Option-name mappings default to **Color**, **Size** and **Type**, and method values default to **Print** and **Embroidery**. The studio resolves the matching available variant; missing or unavailable combinations are not replaced with a different variant. `size_as_property` is off by default and should be enabled only when made-to-order size is intentionally an order property instead of a native size variant.

**Customize studio — garment photos**: the four shared image pickers are Hoodie front (`mockup_hoodie_front`), Hoodie back (`mockup_hoodie_back`), Tee front (`mockup_tee_front`) and Tee back (`mockup_tee_back`). Each garment-colour block has per-colour overrides for all four views. Use square photos with the same crop; uploaded photos retain their real colour and are not automatically recoloured. The included black, white, burgundy and beige hoodie-back mockups and drawn garment fallback remain available; no external image URL is needed.

Photo priority: **per-colour upload → shared upload → built-in hoodie-back photo
→ drawn fallback**. Clear a colour's override if you want it to use the shared
photo; changing the shared picker cannot replace an active per-colour override.

**Customize studio — quantity pricing**: `volume_pricing_enabled` is off by default. Add `price_tier` blocks only for real Shopify rates: `quantity` sets the minimum piece count, and `discount` sets the discount percentage (default `0`). Totals shown by the studio are estimates; configure matching Shopify automatic discounts separately for checkout. The estimate may read per-variant `quantity_price_breaks` exposed by Shopify, but the studio does not enforce quantity-rule minimums, increments or maximums. The checked-in preview catalog has no price-break tiers. The live Shopify cart and checkout are authoritative; do not invent or publish unconfigured rates.

**Customize studio — order and touch behavior**: shoppers can upload distinct front/back artwork; each side's position, scale and rotation are recorded. Every piece keeps its selected size. Identical variant-and-size pieces are grouped into one order line with `Size` and a `Piece` list; design files, generated JPEG mockups and placement properties travel with the line. Outside Edit/Move design, the canvas declares CSS `touch-action: pan-y pinch-zoom`; Edit/Move enables dragging. Automated checks verify no wheel-event hijack, but this does not establish touch behavior on a physical phone.

**Typography (4.1)** — Theme settings → Appearance → **Font style**:
- **Street** (default): Arabic headings **Alexandria**, Arabic and English body **Fustat** (both by the Cairo type designer Mohamed Gaber), English headings **Unbounded**.
- **Bubble**: **Baloo Bhaijaan 2** (Arabic + English text) with **Bagel Fat One** English headings — the rounded, playful option.
- **Classic**: the previous Thmanyah Sans / Froople / Mochi Tubby set.

Street and Bubble are **SIL Open Font License 1.1** fonts from the official Google Fonts repository (licences and the pinned source commit in `licenses/fonts/`), so they are cleared for your store, for self-hosting and for redistribution with the theme. Each family ships as an Arabic and a Latin WOFF2 with `unicode-range`, so a page downloads only the script it shows (measured on the home page: English ≈ 81 KB and Arabic ≈ 130 KB of fonts, versus 206 KB and 228 KB before). The subsets are unhinted on purpose: the original Alexandria hinting hides the dots of a final ي at some sizes.

The **Classic** fonts are still not cleared: the Mochi archive says *Free for Personal Use*, the Froople archive has no licence text, and the Thmanyah licence restricts hosting the font files for web embedding. Use Classic only with written permission.

**New in 4.0 — check before publishing**
- Discount codes shown by the theme (`LINUX10` in the announcement, offer spotlight and popup) must exist in **Discounts**; change or clear them in the editor otherwise.
- Assign the **page.faq** template to your `faq` page (Online Store → Pages → faq → Theme template).
- Payments: Theme settings → **Payments** — leave on only the methods you really accept.
- The promo popup opens after 12 s / on exit, once every 7 days; turn it off under Footer → Promo popup if you prefer.
- Email templates: `notifications/README.md` (paste per notification, then *Send test email*).

## Before you publish — store data the theme expects

The zip only contains the theme. These live in your Shopify admin and the theme reads them by handle:

| What | Where | Handle / value |
| --- | --- | --- |
| Main menu | Navigation → Menus → **Main menu** (`main-menu`) | Items: Shop (dropdown: Winter collection, Summer collection, Customize print, All products) · Customize → `/?view=customize` · Journal → `/blogs/news` · About → `/pages/about` · Contact → `/pages/contact` |
| Footer menus | Navigation → **Footer shop** (`footer-shop`), **Footer help** (`footer-help`), **Footer about** (`footer-about`) | Or point the three footer blocks at any menus you already have (theme editor → Footer) |
| Pages | Online Store → Pages | `about` (**page.about**), `contact` (**page.contact**), `faq`, `size-guide`, `shipping-returns`. `customize` (**page.customize**) is optional; navigation uses the separately configured **index.customize** alternate template. |
| Collections | Products → Collections | `winter-collection`, `summer-collection`, `customize-print`, `all` — the home sections are pointed at these; change them in the editor |
| Customize products | Products, selected in Customize studio | `product` = hoodie picker; `tee_product` = tee picker. The shipped page settings select `hoodie-customize` for the hoodie and leave the tee unset. Choose items with matching **Color**, **Size** and **Type** variants (or map the actual option names); method values default to **Print** / **Embroidery**. |
| Arabic | Settings → Languages → add Arabic and publish | Use Translate & Adapt for merchant-authored product titles/descriptions, menu labels, pages, blog posts and policies. The theme localizes its own UI and maps only known product-title words; custom untranslated copy is not automatically translated. |

A missing menu shows the English link titles; a missing page gives a 404 on that link.

## العربي

**الخطوط الافتراضية بقت مرخّصة.** إعدادات Street وBubble خطوطها رخصة SIL OFL؛ الإعداد الاختياري Classic بس (Thmanyah / Froople / Mochi) لسه محتاج موافقة مكتوبة. نجاح الفحوص المحلية مش إثبات إن الاستيراد أو رفع الملفات أو الدفع نجح على Shopify الحقيقي؛ سيب الثيم غير منشور لحد ما تراجع إعدادات المتجر وتجربة المعاينة الفعلية.

**اللي في الفولدر**
- `linux-liquid-glass-theme.zip` — الثيم نفسه. ده الملف الوحيد اللي بترفعه.
- `hero-video/` — تلات نسخ من فيديو التطريز (ديسكتوب ~1 ميجا، تابلت ~0.6، موبايل عمودي ~0.3) + البوستر، لو عايز تستخدمهم في مكان تاني. موجودين جوه الثيم أصلاً.
- `brand-assets/` — البطاريق، اللوجو، الفافيكون، وصور البراند اللي الثيم بيستخدمها.
- `LINUX-product-photos.zip` (جنب ملف التسليم) — صور المنتجات الجديدة بخلفية استوديو واحدة ومقاس ٤:٥، ونسخ غامقة، وقص شفاف، وأغلفة المجموعات. ارفع `01.webp`، `02.webp`… لكل منتج بالترتيب؛ التعليمات في `photos/README.md`.
- `licenses/fonts/` — رخص SIL OFL للخطوط الافتراضية.

**التركيب (٥ دقايق)**
1. لوحة تحكم Shopify ← **Online Store ← Themes ← Add theme ← Upload zip file** ← اختار `linux-liquid-glass-theme.zip`.
2. دوس **Customize** على الثيم الجديد (مش هينزل لايف غير لما تدوس Publish).
3. **Theme settings ← Brand & social**: الواتساب وروابط التواصل. **Cart & checkout**: حد الشحن المجاني. **Product page**: مواعيد التوصيل.
4. **الصفحة الرئيسية**: كل سكشن بلوك تقدر ترتّبه أو تخفيه. اختار الكوليكشنز لـ *الأكثر طلباً* / *تسوّق حسب الإصدار* / *طازة من الماكينة*. خانات النص الفاضية بتعرض ترجمة الثيم المدمجة بس لو الخانة مربوطة بمفتاح ترجمة؛ أي نص تكتبه بيظهر زي ما كتبته.
5. **استوديو التخصيص**: روابط التنقل بتفتح `/?view=customize`، وبالعربي `/ar?view=customize`، من القالب **index.customize**. افتح القالب البديل ده في محرر الثيم واختار الهودي الفعلي في `product` والتيشيرت في `tee_product`. المسار ده مش محتاج إنشاء Page. لو هتستخدم كمان `/pages/customize` بقالب **page.customize**، اضبط إعداداته لوحده؛ إعدادات القالبين مش بتتزامن.
6. **العربي**: Settings ← Languages ← **Add language ← Arabic ← Publish**.
   النصوص الخاصة بواجهة الثيم موجودة في `theme/locales/ar.json` والواجهة بتتحول
   RTL. فيه fallback محدود لبعض الكلمات المعروفة في أسماء المنتجات (hoodie ←
   هودي، black ← أسود)، والكلمات غير المعروفة بتفضل زي ما هي. ده مش ترجمة تلقائية
   لمحتوى المتجر؛ استخدم **Translate & Adapt** لعناوين وأوصاف المنتجات والصفحات
   ومقالات المدونة والسياسات اللي كتبتها بنفسك.
7. **Publish بعد** حسم حقوق الخطوط ومراجعة الإعدادات واختبار معاينة Shopify الحقيقي.

**فحص المعاينة الحقيقي**: راجع المنتجين وتركيبات اللون والمقاس والطريقة المتاحة،
وسيّب تخصيص التيشيرت مقفول لحد اختيار منتجه. ضيف عدة قطع بمقاسات مختلفة وتصميم
قدام وورا، وافتح روابط التصميمات الأصلية والموكبات في الطلب وراجع بيانات المكان.
اختبر انقطاع الإضافة وإعادة المحاولة، وراجع إجمالي السلة والدفع والخصومات والشحن.
الملفات بتترفع بطلبات متتابعة لكل مجموعة فاريانت/مقاس؛ نجاح المحاكاة المحلية مش
دليل على حفظ الملفات في Shopify. جرّب سكرول اللمس على موبايل فعلي.

**العدّ التنازلي**: Home ← Hero ← **Offer countdown** ← **Campaign end timestamp**.
اكتب انتهاء العرض الحقيقي مع المنطقة الزمنية بصيغة `YYYY-MM-DDTHH:mm:ss+03:00`
أو UTC بصيغة `YYYY-MM-DDTHH:mm:ssZ`. الخانة الفاضية أو القيمة غير الصالحة بتخفي
العداد؛ بعد الانتهاء بيظهر إن العرض خلص، ومش بيبدأ وقت جديد. اضبط نفس الموعد في
Shopify Discounts، لأن العداد مش هو اللي بيوقف الخصم.

**الأوفر سايز**: الهودي والتيشيرت بقَصّة واسعة. حط قياسات فعلية ومراجَعة في دليل
المقاسات؛ ما تخترعش قياسات ولا تعتبر اقتراح الطول والوزن ضمانًا للمقاس.
كل قطعة في الطلب بتحتفظ بالمقاس اللي العميل اختاره لها.

**عرض الباندل في صفحة المنتج**: البلوك بيعرض اختيارات كمية وأسعار تقديرية، لكنه ما بيطبّقش خصم عند الدفع. استخدم بس النسب والكميات اللي قررتها فعلاً واعمل خصومات Shopify التلقائية المطابقة؛ اختبرها في معاينة حية، وما تعتبرش القيم الافتراضية خصماً مؤكداً.

**اعرف مقاسك**: بلوك في صفحة المنتج كمان. بيقترح مقاس من الطول والوزن ومكتوب تحته إنه استرشادي مش مؤكد. تقدر تشيله من أي منتج بحذف البلوك.

**كود الخصم في الشنطة**: متكامل مع Cart API بتاع Shopify. الكود لازم يكون موجود في Discounts؛ راجع شروطه وقواعد دمجه والإجمالي الفعلي في المعاينة الحقيقية. أكواد الاختبار المحلية مش دليل إنها موجودة في متجرك.

**منتجات ومتغيرات الاستوديو**: حقل `product` للهودي وحقل `tee_product` للتيشيرت. بيانات الصفحة المرفقة بتختار `hoodie-customize` للهودي وما بتختارش تيشيرت؛ اختار منتجك الفعلي في الحقلين. أسماء الخيارات الافتراضية **Color / Size / Type** وقيم الطريقة **Print / Embroidery**. الاستوديو يطابق الفاريانت المتاح فعلاً، ومش بيبدّل لمقاس أو فاريانت تاني لو الاختيار مش موجود. `size_as_property` مطفي افتراضياً؛ شغّله فقط لو المقاس معمول حسب الطلب ومش فاريانت أصلي.

**صور الملابس**: فيه أربع خانات صور مشتركة لقدام وورا الهودي والتيشيرت، وكل بلوك لون يقدر يستبدل الصور الأربع بلون مختلف. استخدم صور مربعة وبنفس القصّ؛ الصور المرفوعة بتحتفظ بلونها الأصلي ومش بتتلون تلقائياً. صور ظهر الهودي المدمجة بالأسود والأبيض والبرجندي والبيج، والموكب المرسوم، لسه موجودين كـ fallback. مش محتاج روابط صور خارجية.

أولوية الصور: **صورة اللون الخاصة ← الصورة العامة ← صورة ظهر الهودي المدمجة
← الموكب المرسوم**. امسح الصورة الخاصة من بلوك اللون لو عايزه يستخدم الصورة
العامة؛ تغيير الصورة العامة ما بيستبدلش صورة لون خاصة لسه متفعّلة.

**أسعار الكميات**: `volume_pricing_enabled` مقفول افتراضياً. أضف بلوكات `price_tier` بس للنسب اللي موجودة فعلاً في Shopify: `quantity` هو أقل عدد قطع، و`discount` نسبة الخصم وقيمتها الافتراضية `0`. الإجماليات المعروضة تقديرية؛ لازم تعمل خصم Shopify تلقائي مطابق عشان يتطبق عند الدفع. ممكن التقدير يقرأ `quantity_price_breaks` لو Shopify رجّعها للمتغير، لكن الاستوديو مش بيفرض حد أدنى أو زيادة ثابتة أو حد أقصى لقواعد الكميات. الكتالوج التجريبي المرفق مافيهوش شرائح أسعار. سلة Shopify والدفع الفعلي هما المرجع؛ ما تخترعش نسب خصم.

**الطلب واللمس**: العميل يرفع تصميم منفصل للقدام والورا؛ مكان كل تصميم وحجمه ودورانه بيتسجلوا. مقاس كل قطعة محفوظ. القطع اللي لها نفس الفاريانت والمقاس بتتجمع في سطر كمية واحد ومعاه خاصيتا `Size` و`Piece` لأرقام القطع، بدل سطر منفصل وملفات مكررة لكل قطعة. خارج وضع Edit/Move، لوحة القطعة بتعلن CSS `touch-action: pan-y pinch-zoom`؛ وضع Edit/Move بيفعّل السحب. الاختبارات الآلية بتتأكد إن عجلة الماوس مش محجوزة، لكنها مش اختبار للمس على موبايل فعلي.

**الخطوط (4.1)** — Theme settings ← Appearance ← **Font style**:
- **Street** (الافتراضي): عناوين العربي بخط **الإسكندرية (Alexandria)**، والنصوص العربي والإنجليزي بخط **فسطاط (Fustat)** — الاتنين من تصميم المصمم المصري محمد جابر — وعناوين الإنجليزي بخط **Unbounded**.
- **Bubble**: خط **Baloo Bhaijaan 2** للنصوص عربي وإنجليزي، و**Bagel Fat One** لعناوين الإنجليزي — الاختيار المدوّر المرح.
- **Classic**: الخطوط القديمة (Thmanyah Sans / Froople / Mochi Tubby).

خطوط Street وBubble رخصتها **SIL Open Font License 1.1** من مستودع Google Fonts الرسمي (الرخص ومصدرها في `licenses/fonts/`)، يعني مسموح استخدامها في المتجر ورفعها مع الثيم. كل خط متقسم ملف عربي وملف لاتيني، والصفحة بتنزّل اللي محتاجاه بس (على الصفحة الرئيسية: الإنجليزي ≈ ٨١ كيلو خطوط والعربي ≈ ١٣٠ كيلو، بدل ٢٠٦ و٢٢٨ كيلو قبل كده). الملفات من غير hinting عن قصد، لأن الـ hinting الأصلي في خط الإسكندرية كان بيخفي نقط الياء الأخيرة في بعض المقاسات.

خطوط **Classic** لسه رخصتها مش واضحة: Mochi «للاستخدام الشخصي»، وFroople من غير رخصة، ورخصة Thmanyah بتمنع استضافة ملفات الخط على الويب. ما تستخدمش Classic غير بموافقة مكتوبة.

**جديد في 4.0 — راجعه قبل النشر**
- أي كود الثيم بيعرضه (`LINUX10` في الإعلانات والعرض والنافذة) لازم يكون موجود في **Discounts**، وإلا غيّره أو امسحه من المحرر.
- اختار القالب **page.faq** لصفحة `faq` (Online Store ← Pages ← faq ← Theme template).
- الدفع: Theme settings ← **Payments** — سيب شغّال بس الطرق اللي بتقبلها فعلاً.
- نافذة الترحيب بتفتح بعد ١٢ ثانية أو عند الخروج، مرة كل ٧ أيام؛ تقدر تقفلها من Footer ← Promo popup.
- قوالب الإيميلات: `notifications/README.md` (انسخ كل قالب وبعدين *Send test email*).

## قبل النشر — البيانات اللي الثيم بيقرأها من المتجر

الملف المضغوط فيه الثيم بس. الحاجات دي في لوحة Shopify والثيم بيقرأها بالـ handle:

| إيه | فين | الـ handle / القيمة |
| --- | --- | --- |
| القائمة الرئيسية | Navigation ← Menus ← **Main menu** (`main-menu`) | Shop (قائمة منسدلة: Winter collection، Summer collection، Customize print، All products) · Customize ← `/?view=customize` · Journal ← `/blogs/news` · About ← `/pages/about` · Contact ← `/pages/contact` |
| قوائم الفوتر | Navigation ← `footer-shop` و`footer-help` و`footer-about` | أو وجّه بلوكات الفوتر التلاتة لأي قوائم عندك (محرر الثيم ← Footer) |
| الصفحات | Online Store ← Pages | `about` (**page.about**)، `contact` (**page.contact**)، `faq`، `size-guide`، `shipping-returns`. صفحة `customize` بقالب **page.customize** اختيارية؛ التنقل بيستخدم **index.customize** وإعداداته منفصلة. |
| الكولكشنز | Products ← Collections | `winter-collection`، `summer-collection`، `customize-print`، `all` — سكاشن الرئيسية موجّهة ليهم وتقدر تغيّرهم من المحرر |
| منتجات التخصيص | Products، من محرر Customize studio | `product` للهودي و`tee_product` للتيشيرت. إعداد الصفحة الحالي يختار `hoodie-customize` ويترك التيشيرت بدون اختيار؛ اربط منتجات متجرك الفعلية. لازم تتطابق خيارات **Color / Size / Type** وقيم **Print / Embroidery**، أو غيّر أسماء الربط من السكشن. |
| العربي | Settings ← Languages ← أضف العربية وانشرها | استخدم Translate & Adapt لعناوين وأوصاف المنتجات والقوائم والصفحات ومقالات المدونة والسياسات اللي كتبتها بنفسك. واجهة الثيم مترجمة، لكن fallback أسماء المنتجات محدود للكلمات المعروفة؛ المحتوى المخصص غير المترجم لا يتحول تلقائياً للعربي. |

قائمة ناقصة بتظهر بعناوين لينكاتها الإنجليزية؛ صفحة ناقصة بتدّي 404 على اللينك بتاعها.
