# LINUX theme — دليل التحكم من لوحة الأدمن / Admin control guide

**العربي أولاً 👇 / English below**

الدليل ده بيوضح إعدادات الموقع الأساسية اللي تقدر تعدّلها من غير كود.

**قبل النشر:** حسم حقوق تضمين الخطوط واختبار Shopify الحقيقي شرط للتسليم
الإنتاجي؛ راجع [دليل التركيب](INSTALL.md). الخصومات التجريبية مش عروض مفعّلة.

**افتح القالب الصح:** نجمة التخصيص وروابط الموقع بتفتح `/?view=customize`
(وبالعربي `/ar?view=customize`) من **index.customize**. افتح القالب البديل ده
في محرر الثيم واضبط سكشن **Customize studio** فيه. صفحة `/pages/customize`
بقالب **page.customize** اختيارية ولها إعدادات منفصلة؛ تعديل صورها أو أسعارها
مش بيغير وجهة النجمة. راجع الوجهة نفسها بعد الحفظ.

**أولوية الموكبات:** صورة اللون الخاصة، ثم الصورة المشتركة، ثم صورة ظهر الهودي
المدمجة، ثم الرسم الاحتياطي. امسح الصورة الخاصة باللون لو عايز الصورة العامة
الجديدة تظهر. التيشيرت مش متاح للطلب قبل اختيار منتج تيشيرت فعلي.

**الأوفر سايز والعداد:** راجع القياسات الحقيقية في دليل المقاسات من غير اختراع
أبعاد. للعداد، افتح Home → Hero → **Offer countdown** واكتب **Campaign end
timestamp** الحقيقي مع المنطقة الزمنية؛ الخانة الفاضية بتخفيه. اضبط نفس انتهاء
العرض في Shopify Discounts؛ العداد ما بيشغّلش الخصم ولا بيوقفه.

## 1. إعدادات الثيم العامة (Online Store → Themes → Customize → ⚙️ Theme settings)

| المجموعة | اللي تتحكم فيه |
| --- | --- |
| **Appearance** | السكيم (غامق/فاتح) · **ألوان البراند** (الأخضر الغابة، الكريمي، الليموني — سيبها فاضية للافتراضي) · قوة الزجاج · استدارة الزوايا · الحركة · ستارة اللوجو · عرض الصفحة · **حجم النص** و**حجم العناوين** (٪) · خطوط البراند مفعّلة تلقائياً · الفافيكون · صورة المشاركة |
| **Layout & spacing** | المسافة بين السكاشن (٪) · البادينج الجانبي (٪) · **حجم النص على الموبايل** (٪) · إظهار/إخفاء التاب بار تحت · عمود واحد أو عمودين للمنتجات على الموبايل |
| **Navigation** | منيو الموبايل · كلمات البحث الشائعة · إظهار مبدّل اللغة · إظهار المفضلة (القلب) |
| **Cart & checkout** | درج أو صفحة · حد الشحن المجاني · تنبيه "باقي X قطع" · خانة الملاحظات · خانة كود الخصم · اقتراحات "كمّل اللوك" |
| **Product page** | دليل المقاسات · شريط الإضافة اللاصق · شوهدت مؤخراً · تقدير التوصيل ونصوصه · شارة "مطرّز في القاهرة" · زرار المشاركة · الإضافة السريعة من الكارت · اسم البراند على الكارت · السعر المشطوب |
| **404 page** | البحث · المنتجات الشائعة · الكولكشن المستخدم |
| **Footer** | أيقونات الدفع · روابط السياسات · نص "صُنع في" |
| **Brand & social** | رقم الواتساب · **مكان فقاعة الواتساب** (صفحة التخصيص فقط / كل الصفحات / مخفية) · رسالة الواتساب الافتتاحية · روابط إنستجرام / تيك توك / فيسبوك / يوتيوب / X |

## 2. السكاشن (كل صفحة → السكشن → إعداداته)

- **Header**: اللوجو وارتفاعه · المنيو · زرار Shop ونصه ولينكه · شريط الإعلان ونصه · بلوكات صور الميجا منيو. الهيدر ثابت في كل الصفحات: يختفي وانت نازل ويرجع أول ما تطلع.
- **Hero (فيديو التطريز)**: الفيديو · البوستر · ارتفاع الفيديو على الديسكتوب وعلى الموبايل (الافتراضي: الشاشة كلها) · تعتيم الفيديو (الافتراضي: صفر) · **مكان اللوح الزجاجي (تحت الفيديو — الافتراضي — أو فوقه)** · العنوان الصغير/الكبير/الفرعي · الزرارين ولينكاتهم · صف الثقة (3 نصوص). مافيش أزرار على الفيديو.
- **Customize studio** (`/?view=customize`، قالب `index.customize`؛ أو الصفحة الاختيارية بقالب `page.customize`):
  - **المنتجات**: `product` للهودي و`tee_product` للتيشيرت. بيانات الصفحة الحالية تختار `hoodie-customize` للهودي وتترك التيشيرت بدون اختيار؛ اختار منتجات متجرك الفعلية في الحقلين.
  - **الفاريانت والمقاس**: أسماء الخيارات الافتراضية **Color / Size / Type** والقيم **Print / Embroidery**. الاستوديو يطابق الفاريانت المتاح من خيارات المنتج الفعلية، ولا يستبدل الاختيار بفاريانت أول أو بمقاس آخر. أي تركيبة غير موجودة أو غير متاحة تمنع الإضافة. `size_as_property` مطفي افتراضياً؛ فعّله فقط لو المقاس خاص ومش فاريانت في Shopify.
  - **الصور**: أربع خانات مشتركة للهـودي والـتيشيرت، قدام وورا، ومع كل بلوك لون أربع صور بديلة خاصة به. استخدم صور مربعة بنفس القص؛ الصور المرفوعة تفضل بلونها الأصلي. صور ظهر الهودي المدمجة (أسود / أبيض / برجندي / بيج) والموكب المرسوم يفضلوا كـ fallback، ومش محتاج روابط خارجية.
  - **الأسعار**: `volume_pricing_enabled` مقفول افتراضياً. أضف بلوكات `price_tier` للنسب الحقيقية فقط؛ `quantity` هو أقل عدد قطع و`discount` نسبة الخصم، وقيمتها الافتراضية `0`. السعر الإجمالي المعروض تقديري ولا يتحول لخصم دفع بدون خصم Shopify تلقائي مطابق. ممكن التقدير يقرأ شرائح أسعار المتغير لو Shopify وفّرها، لكن الاستوديو ما بيفرضش حد أدنى أو زيادة أو حد أقصى لقواعد B2B. الكتالوج التجريبي المرفق مافيهوش شرائح أسعار؛ سلة Shopify والدفع الفعلي هما المرجع.
  - **الطلب واللمس**: العميل يرفع تصميم مستقل للقدام والورا، ومكان/حجم/دوران كل واحد بيتحفظوا. مقاس كل قطعة يفضل محفوظ؛ القطع ذات الفاريانت والمقاس المتطابق تتجمع في سطر واحد بخاصيتي `Size` و`Piece`. خارج وضع Edit/Move، لوحة القطعة بتعلن CSS `touch-action: pan-y pinch-zoom`؛ الوضع بيفعّل السحب. الاختبارات الآلية بتتأكد إن عجلة الماوس مش محجوزة، لكنها مش اختبار لمس على موبايل فعلي.
- **404**: العنوان الصغير/الكبير/النص · الزرار ولينكه · البطريق · البحث · المنتجات الشائعة وعددها والكولكشن · **بلوكات روابط سريعة** (عنوان، نص، لينك، أيقونة — أو مفتاح ترجمة).
- **Product page**: الفتات · شارة التقييم ونصها · زرار واتساب تحت الإضافة (مطفي افتراضياً) · بلوكات: الوصف / القماش / الشحن / عرض الباندل (الكميات والنسب) / اعرف مقاسك / أكورديون مخصص.
- باقي السكاشن (Marquee, Bestsellers, Collections, Campaign, Shop the look,
  Value props, Statement, Reviews, Instagram, FAQ, Newsletter, Penguins,
  Footer): كلها بلوكات وإعدادات نصوص وصور ولينكات. الخانة الفاضية بتستخدم ترجمة
  الثيم لو كانت مربوطة بمفتاح ترجمة؛ النص اللي تكتبه بنفسك بيفضل زي ما هو ومش
  بيتترجم تلقائياً.

## 3. النصوص الثابتة (أزرار، رسائل، لابلات)

Online Store → Themes → ⋯ → **Edit default theme content**، أو **Translate & Adapt**
للعربي جنب الإنجليزي. الملفان `locales/en.default.json` و`locales/ar.json`
بيترجموا نصوص واجهة الثيم. fallback أسماء المنتجات محدود للكلمات المعروفة،
والكلمات غير المعروفة بتفضل زي ما هي. ترجم أوصاف المنتجات ومحتوى الصفحات
والمدونة والسياسات اللي كتبتها بنفسك عبر Translate & Adapt؛ النص المخصص مش
بيترجم تلقائياً. الخانات الفاضية بتستخدم ترجمة الثيم بس لما تكون مربوطة بمفتاح
ترجمة.

## 4. طلبات التخصيص — إيه اللي بيوصلك في الأوردر

كل طلب تخصيص بيوصل كـ line-item properties على منتج التخصيص:

| الخاصية | القيمة |
| --- | --- |
| Front design / Back design | رابط ملف التصميم الأصلي لكل جهة؛ افتحه من خصائص الطلب وتحقق منه على Shopify الحقيقي |
| **Front mockup / Back mockup** | **صورة JPEG للقطعة بعد وضع التصميم عليها** بنفس المكان والحجم والدوران لكل جهة فيها تصميم؛ راجع رابطها في الطلب |
| Sides | `Front + Back` أو `Front` أو `Back` |
| Garment / Colour / Method | القطعة · اللون · طباعة/تطريز |
| Sizes | مقاس كل قطعة بالترتيب `1:L, 2:M, …` |
| Size / Piece | المقاس المشترك للقطع في السطر، وأرقام القطع المجمّعة فيه؛ المقاسات المختلفة تفضل منفصلة ولا تضيع |
| Front position / Back position | `x:50,y:42,scale:46,rotate:15` (٪ من عرض القطعة + زاوية الدوران) |
| Notes | ملاحظات العميل |

الفاريانت يُختار من Color × Size × Type الفعلية (أو من Color وType فقط عند تفعيل المقاس كخاصية طلب). تركيبة غير متاحة لا تُستبدل تلقائياً. إجمالي الاستوديو تقديري ويتأثر بشرائح سعر المتغير إذا ظهرت في بيانات Shopify، لكنه لا يطبق قواعد B2B للحد الأدنى أو الزيادة أو الحد الأقصى. إعداد الكتالوج التجريبي الحالي فيه القاعدة الافتراضية (حد أدنى قطعة واحدة، بلا حد أقصى، وزيادة قطعة واحدة) ولا يحتوي شرائح أسعار. سلة Shopify الفعلية والدفع هما المرجع.

## 5. الخطوط

**الخطوط (4.2)** — Theme settings ← **Typography**: خط لكل دور ولكل لغة:
- **عناوين العربي**: **رقّاص (Rakkas)** — مأخوذ من خط الرقعة في أفيشات السينما المصرية في الخمسينات والستينات (الافتراضي). بدائل: **اليمامة (Alyamama)** نسخ حديث قريب من روح ثمانية، الإسكندرية، Baloo Bhaijaan 2، وBadeen Display.
- **نصوص العربي**: **Alan Sans** (الافتراضي) — واضح حتى في ١٤ بكسل. بدائل: فسطاط، اليمامة، Baloo Bhaijaan 2.
- **الإنجليزي**: عناوين **Unbounded** ونصوص **Fustat** زي ما هم (بدائل: Bagel Fat One، Rakkas، Alexandria / Alan Sans، Baloo).
- **خط الإكسنت**: **Badeen Display** للشارات والبادچات الموسمية ولشكل «مرح» في استوديو التصميم. أرقامه شكلها لاتيني، فالأرقام والفواصل بتيجي أوتوماتيك من الخط اللي بعده.
- الخطوط القديمة (Thmanyah / Froople / Mochi) لسه موجودة كاختيارات مكتوب جنبها «licence needed».

كل الخطوط دي (الافتراضي والبدائل) رخصتها **SIL Open Font License 1.1** من مستودع Google Fonts الرسمي (الرخص والمصدر في `licenses/fonts/`)، يعني مسموح تستخدمها في المتجر وترفعها مع الثيم. كل خط متقسم ملف عربي وملف لاتيني بـ`unicode-range`، والصفحة بتحمّل بس خطوط لغتها (ملفين العربي الافتراضيين: رقّاص ≈ ٢٠ ك.ب + Alan Sans ≈ ٢٥ ك.ب). الملفات من غير hinting عن قصد (الـ hinting الأصلي في الإسكندرية كان بيخفي نقط الياء الأخيرة)، واتأكدنا إن نقط الياء ظاهرة في كل الأوزان. الرندر اتجرّب على كروم بس؛ سفاري وويندوز لسه.

الخطوط القديمة لسه رخصتها مش واضحة: Mochi «للاستخدام الشخصي» وملفه نفسه مكتوب فيه «All rights reserved»، وFroople من غير رخصة، ورخصة Thmanyah بتمنع استضافة ملفات الخط على الويب (وكمان مافيهوش فاصل الآلاف العربي ٬). ما تختارهمش غير بموافقة مكتوبة.

## 6. الجديد في 4.0 — تتحكم فيه منين

| الحاجة | مكانها |
| --- | --- |
| شفافية الزجاج والانكسار | Theme settings → **Appearance** → *Glass tint* (أقل = أشفّ) و*Liquid refraction* (Off / Subtle / Strong). الانكسار بيبان على كروم وأندرويد بس؛ سفاري بياخد زجاج مطفي. |
| شريط الإعلانات | Header → *Show announcement* + بلوكات **Announcement** (نص أو مفتاح ترجمة، أيقونة، لينك، كود). *Countdown end* بصيغة `2026-11-30T23:59:00+02:00` بيظهر عدّاد ويختفي لوحده. *Announcement style* = رسايل متغيّرة أو شريط متحرك. |
| كارت العرض | سكشن **Offer spotlight** في الرئيسية: الكود، نهاية العرض (اختياري)، الزرار، الصورة أو منتج. سيبه فاضي = نص الثيم بالعربي والإنجليزي. |
| نافذة الترحيب | Footer group → **Promo popup**: تفعيل، التوقيت (بعد ثواني / عند الخروج)، يظهر تاني بعد كام يوم، الصفحات، الكود، تسجيل النيوزليتر. ارفع *Campaign version* عشان حملة جديدة تظهر للناس اللي قفلتها قبل كده. |
| الريلز | سكشن **Video reels**: كل بلوك = فيديو (من Shopify) + منتج. من غير فيديو بيشتغل فيديو التطريز كبديل. |
| شارات الدفع | Theme settings → **Payments** — اتحدّثت في 4.2 (شوف الجدول تحت). |
| بلّغني لما يرجع | بيظهر لوحده على المقاس الخلصان. الطلبات بتوصل إيميل المتجر (Settings → Store details) بعنوان فيه Product / Variant / Link. |
| عرض الباندل | Product page → بلوك Bundle → *Matching automatic discount is live*: شغّله **بس** بعد ما تعمل الخصم الأوتوماتيك المطابق في Discounts. |
| التقييمات | الشارة بتظهر بس لو في تطبيق تقييمات بيكتب `reviews.rating` و`reviews.rating_count` (زي Shopify Product Reviews / Judge.me). مفيش أرقام وهمية. |
| الأسئلة الشائعة | افتح صفحة `faq` من Online Store → Pages واختار القالب **page.faq**. |
| إيميلات الإشعارات | `notifications/README.md` — تنسخ كل قالب في Settings → Notifications. |
| إعلانات السوشيال | `marketing/README.md` — بوستات وستوريز وفيديو جاهزين، وتعدّل النص من `copy.json`. |

## 7. الجديد في 4.1 — تتحكم فيه منين

| الحاجة | مكانها |
| --- | --- |
| نوع الخط | اتغيّر في 4.2: Theme settings ← **Typography** (شوف تحت) |
| لون السكشن | أي سكشن (Best sellers، Product grid، Value props، Newsletter، FAQ، Testimonials، Statement) ← **Colour**: Forest / Cream sheet / Lime sheet |
| فقاعات الأقسام | سكشن **Category bubbles**: كل بلوك = مجموعة (الصورة من صورة المجموعة أو أول منتج) أو «Link to the Customize studio»، ونقطة «جديد» اختيارية |
| الشرايط | سكشن Marquee ← **Style**: Woven ribbons / Classic ticker |
| موكب الاستوديو | اتغيّر في 4.2 — شوف «الموكب الجديد» تحت. أي صورة ترفعها بتغلب |
| صور المنتجات الجديدة | فولدر `photos/` (أو `LINUX-product-photos.zip`): ارفع `01.webp`، `02.webp`… لكل منتج بالترتيب من Products ← المنتج ← Media. التعليمات في `photos/README.md` |
| الانكسار | Theme settings ← Appearance ← **Liquid refraction** (مقفول افتراضياً عشان السرعة) |

## 8. الجديد في 4.2 — تتحكم فيه منين

| الحاجة | مكانها |
| --- | --- |
| الخطوط | Theme settings ← **Typography**: عناوين العربي، نصوص العربي، عناوين الإنجليزي، نصوص الإنجليزي، وخط الإكسنت — كل واحد لوحده (الافتراضي رقّاص + Alan Sans، Unbounded + فسطاط، Badeen Display) |
| طرق الدفع | Theme settings ← **Payments**: الدفع عند الاستلام، إنستاباي (+ العنوان واللوجو اختياري)، فودافون كاش (+ الرقم واللوجو اختياري)، و*Show card logos* مقفول. «إزاي تدفع؟» في الشنطة بنصوص تتعدّل. وضيف نفس الطرق من Settings ← Payments ← Manual payment methods (الخطوات في INSTALL.md) |
| الباندل من أي منتج | صفحة المنتج ← بلوك Bundle ← **Other pieces can be**: أي منتج في المتجر (أو كولكشن تختاره) / المنتجات اللي تختارها بس / نفس المنتج بس. منتج التخصيص والمنتجات اللي عليها تاج `no-bundle` مش بتظهر |
| الكولكشن الصيفي والشتوي | سكشن **Seasonal collection** (مرتين في الرئيسية): الموسم (صيف بشمس لابسة نضارة وحر / شتا براجل تلج وتلج بيقع)، الكولكشن، عدد المنتجات، كل النصوص، بادچ الحرارة، مكان الرسمة، الأنيميشن، كمية التلج، البطريق، اللون، والمسافات |
| استوديو التصميم | سكشن Customize ← **Studio tools**: الكتابة بدل الصورة (وحد أقصى للحروف وألوان الكتابة)، أزرار مكان التصميم (نص الصدر / الجيب / الصدر كله / أعلى الضهر / نص الضهر / الضهر كله)، فحص جودة الصورة، عرض منطقة الطباعة الحقيقي بالسنتيمتر لكل قطعة ووش، وشريط الإجمالي الثابت على الموبايل |
| الموكب الجديد | ١٦ صورة: هودي وتيشيرت أوفر سايز قدام وورا بـ٤ ألوان (من بلوك اللون ← Built-in mockup photos). المصادر والرخص في `licenses/mockups/SOURCES.md` |
| التعريب | كل النصوص في Online Store ← Themes ← ⋯ ← **Edit default theme content** (عربي/إنجليزي)، بما فيها رسايل الشنطة والباندل اللي كانت مكتوبة جوه الكود |

## English

Where to find the storefront's main no-code settings:

**Before publishing:** clear font-embedding rights and complete a real Shopify
preview test; see [INSTALL.md](INSTALL.md). Local fixture discounts are not live
offers. Order-upload links are provided by Shopify; `/uploads/` is the local
emulator's URL convention, not a guaranteed production path.

**Edit the template actually linked by navigation:** the star and storefront
links open `/?view=customize` (Arabic `/ar?view=customize`), rendered by
**index.customize**. Open that alternate template in the theme editor and edit
its **Customize studio** section. The optional `/pages/customize` page uses
**page.customize** with independent settings; edits there do not update the
star's destination. Verify the linked storefront route after saving.

**Photos and fit:** per-colour upload overrides shared upload, then the built-in
hoodie-back photo and drawn fallback. Clear a colour override to use the shared
photo. Tee ordering stays disabled until a real tee product is selected. Both
garments are oversized; use verified garment measurements in the size guide.

**Countdown:** Home → Hero → **Offer countdown** → **Campaign end timestamp**.
Use the real expiry with an explicit timezone; blank hides the timer. Configure
the same expiry in Shopify Discounts—the timer does not enforce eligibility.

### Theme settings (Customize → ⚙️)
- **Appearance**: scheme, **brand colours** (forest / cream / lime — blank = default), glass strength, radius, motion, curtain, page width, **text size %**, **headline size %** (brand fonts are always enabled), favicon, share image.
- **Layout & spacing**: section gap %, side padding %, **mobile text size %**, bottom tab bar on/off, one or two product columns on phones.
- **Navigation**: mobile menu, popular searches, language switcher on/off, wishlist on/off.
- **Cart & checkout**: drawer/page, free-shipping threshold, low-stock hint, note field, discount-code field, upsell rail.
- **Product page**: size guide, sticky ATC, recently viewed, delivery estimate + texts, "Embroidered in Cairo" chip, share button, card quick-add, vendor on cards, compare-at price.
- **404 page**: search, popular products, collection.
- **Footer**: payment icons, policy links, "Made in" line.
- **Brand & social**: WhatsApp number, **floating WhatsApp bubble scope** (Customize page only / everywhere / hidden), opening message, Instagram / TikTok / Facebook / YouTube / X.

### Sections
- **Hero**: video, poster, desktop & phone height (default: full viewport), dim (default 0), **glass panel placement (below the video — default — or over it)**, eyebrow/headline/subheading, two CTAs and trust row. Nothing sits on the video.
- **Customize studio** (`/?view=customize`, template **index.customize**, or the separately configured optional **page.customize**): choose the hoodie through setting `product` and the tee through `tee_product`. The current template data selects `hoodie-customize` for the hoodie and leaves the tee unset; choose the actual live items. Option-name mappings default to **Color**, **Size** and **Type**, with **Print** / **Embroidery** method values. Variant lookup requires a matching available option combination; missing or unavailable choices are not silently substituted. `size_as_property` is off by default and opts into size-as-property only when size is intentionally not a Shopify variant.
  - Four shared photo pickers cover hoodie front/back and tee front/back; each colour block has four per-colour overrides. Use square photos with matching crops; uploaded photos keep their own colour. Existing black/white/burgundy/beige hoodie-back mockups and the drawn-garment fallback remain available. No external image URLs are required.
- **Pricing**: `volume_pricing_enabled` is off by default. In `price_tier` blocks, `quantity` sets the minimum piece count; the discount percentage field defaults to `0`. Shown totals are estimates, not checkout prices. The estimator can read per-variant `quantity_price_breaks` when Shopify exposes them, but the studio does not enforce B2B rule minimums, increments or maximums. The checked-in preview catalog has no price-break tiers. Shopify's live cart and checkout are authoritative; configure any automatic discounts separately.
- **Orders and touch**: front/back uploads, generated JPEG mockups and each side's position/scale/rotation are order properties. Each piece keeps its size; identical variant-and-size pieces share one order line with `Size` and a `Piece` list. Outside Edit/Move design, the canvas declares CSS `touch-action: pan-y pinch-zoom`; the edit mode enables dragging. Automated checks cover the absence of wheel-event hijacking, not physical-phone touch behavior.
- **404**: copy, CTA, penguin, search, popular products, **quick-link blocks**.
- **Product page**: breadcrumb, rating chip, WhatsApp button (off by default), description / fabric / shipping / bundle / fit-finder / custom accordions.

### Localization

`locales/en.default.json` and `locales/ar.json` localize theme-owned interface
strings. On Arabic product titles, the theme maps a limited set of known words;
unknown words stay unchanged. This is not a general storefront-copy translator: use
Shopify **Translate & Adapt** for merchant-authored product titles/descriptions,
pages, blog posts and policies. An untranslated product description may use the
configured Arabic hoodie/tee fallback copy, but that fallback does not translate
the merchant's English description.

### Order payload from the studio

| Property | What arrives |
| --- | --- |
| `Front design` / `Back design` | Original artwork uploads for each designed side |
| `Front mockup` / `Back mockup` | JPEG preview of the garment with that side's artwork in its saved position |
| `Sides`, `Garment`, `Colour`, `Method` | Selected side(s), garment, colour and Print/Embroidery method |
| `Sizes` | Ordered per-piece list, for example `1:L, 2:M` |
| `Size` / `Piece` | Size and piece numbers for each grouped order line |
| `Front position` / `Back position` | Each side's `x,y,scale,rotate` values |
| `Notes` | Shopper's order note |

The chosen variant matches the mapped **Color × Size × Type** options. Missing
or unavailable combinations are rejected, not replaced with a first-available
variant. Identical variant-and-size pieces share one line, so the order carries
the piece list instead of a separate duplicate line per piece.

### Fonts

**Typography (4.2)** — Theme settings → **Typography**: one font per role and language:
- **Arabic headings**: **Rakkas** — drawn from the Ruqaa lettering of 1950s–60s Egyptian film posters (default). Alternatives: **Alyamama** (modern Naskh, close to the Thmanyah feel), Alexandria, Baloo Bhaijaan 2, Badeen Display.
- **Arabic text**: **Alan Sans** (default) — legible down to 14 px. Alternatives: Fustat, Alyamama, Baloo Bhaijaan 2.
- **English**: **Unbounded** headings and **Fustat** text, as before (alternatives: Bagel Fat One, Rakkas, Alexandria / Alan Sans, Baloo).
- **Accent**: **Badeen Display** for stickers, seasonal badges and the Studio's “Fun” text style. Its digits are Latin-shaped, so digits and separators automatically come from the next font in the stack.
- The previous Thmanyah / Froople / Mochi fonts remain as choices marked “licence needed”.

All of these (defaults and alternatives) are **SIL Open Font License 1.1** fonts from the official Google Fonts repository (licences and pinned source commits in `licenses/fonts/`), cleared for your store, for self-hosting and for redistribution with the theme. Each family ships as an Arabic and a Latin WOFF2 with `unicode-range`, and a page preloads only its own language's files (the two default Arabic files: Rakkas ≈ 20 KB + Alan Sans ≈ 25 KB). The subsets are unhinted on purpose (the original Alexandria hinting hides the dots of a final ي), and the final-ي dots were checked in every weight. Rendering was checked in Chrome only; Safari and Windows are not checked yet.

The previous fonts are still not cleared: the Mochi archive says *Free for Personal Use* and its name table reads “All rights reserved”, the Froople archive has no licence text, and the Thmanyah licence restricts hosting the font files for web embedding (it also lacks the Arabic thousands separator ٬). Choose them only with written permission.

### New in 4.0 — where to control it
- **Glass**: Theme settings → Appearance → *Glass tint* and *Liquid refraction* (edge refraction renders in Chromium only; other browsers keep the frosted glass).
- **Announcement bar**: Header → *Show announcement* + **Announcement** blocks (text or translation key, icon, link, code); optional *Countdown end* (`2026-11-30T23:59:00+02:00`) hides itself when it passes; *Announcement style* rotate / ticker.
- **Offer spotlight** section: code, optional end time (live countdown, auto-hide), button, image or product.
- **Promo popup** (footer group): on/off, trigger (delay / exit intent), repeat after N days, pages, code, newsletter sign-up; raise *Campaign version* to re-show a new campaign.
- **Video reels** section: one block per clip (Shopify video) + product to shop.
- **Payments**: Theme settings → Payments — updated in 4.2 (see below).
- **Back in stock**: automatic on sold-out variants; requests arrive at the store email with Product / Variant / Link.
- **Bundle**: tick *Matching automatic discount is live* only after creating the matching automatic discount.
- **Ratings**: shown only when a reviews app writes `reviews.rating` / `reviews.rating_count`.
- **FAQ**: assign the **page.faq** template to your `faq` page.
- **Email notifications**: see `notifications/README.md`. **Social ad kit**: see `marketing/README.md`.

### New in 4.1 — where to control it
- **Fonts**: replaced in 4.2 by Theme settings → **Typography** (see below).
- **Colour** on Best sellers, Product grid, Value props, Newsletter, FAQ, Testimonials and Statement: Forest, Cream sheet or Lime sheet.
- **Category bubbles** section: one block per collection (image from the collection or its first product) or the Customize studio; optional new-drop dot.
- **Marquee → Style**: woven ribbons or classic ticker.
- **Built-in mockup photos** (studio colour blocks) now cover hoodie front and back in every colour and the tee back in white/black; uploads still win (replaced in 4.2 by the 16-image set below).
- **Studio photo set**: `photos/` (or `LINUX-product-photos.zip`) — upload `01.webp`, `02.webp`… per product in order (Products → product → Media). See `photos/README.md`.
- **Liquid refraction** is off by default for speed; switch it on under Appearance if you want it.

### New in 4.2 — where to control it
- **Typography** (Theme settings): Arabic headings / text, English headings / text and an accent font, each chosen independently (defaults Rakkas + Alan Sans, Unbounded + Fustat, Badeen Display).
- **Payments** (Theme settings): cash on delivery, InstaPay (optional address and logo), Vodafone Cash (optional number and logo); *Show card logos* is off. An editable “How to pay” box sits under the checkout button. Add the same methods under Settings → Payments → Manual payment methods (steps in INSTALL.md).
- **Bundle → Other pieces can be**: any product in the store (or a collection you pick) / only the picked products / only this product. The Customize product and products tagged `no-bundle` are always left out.
- **Seasonal collection** section (twice on the home page): season (summer sun with sunglasses and heat haze / winter snowman with falling snow), collection, product count, all copy, temperature badge, art side, effects, snow amount, mascot, colour and spacing.
- **Customize → Studio tools**: text designs (length limit, text colours), placement buttons, print-quality check, real print widths in cm per garment and side, sticky total bar on phones.
- **Mockups**: 16 ghost-mannequin images — oversized hoodie and tee, front and back, 4 colours (colour block → *Built-in mockup photos*). Sources and licences: `licenses/mockups/SOURCES.md`.
- **Localization**: every string is in Online Store → Themes → ⋯ → **Edit default theme content**, including the bag and bundle messages that used to be hard-coded.
