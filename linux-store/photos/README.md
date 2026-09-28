# صور LINUX — استوديو موحّد / LINUX studio photo set

## بالعربي

**إيه ده؟** ده فولدر صور الكتالوج الجديدة لكل منتجات LINUX بخلفية استوديو موحّدة ("LINUX Stone" كريمي دافئ)، بنفس المقاس (1600×2000 بنسبة 4:5) ونفس مستوى الرأس ونفس الإضاءة، عشان المتجر يبان متناسق وبريميوم.

- `products/<handle>/NN.webp` — الصورة الأساسية لكل منتج (01، 02، … بنفس ترتيب الصور القديمة).
- `products/<handle>/dark/NN.webp` — نسخة بديلة **اختيارية** بخلفية "LINUX Forest" الخضراء الغامقة مع توهج ليموني خفيف (للحملات أو لو حابب شكل داكن).
- `products/<handle>/cutout/NN.webp` — المنتج مفرّغ بخلفية شفافة (للإعلانات والسوشيال والتصميم).
- `collections/<handle>-wide.webp` (1600×1200) و `-tall.webp` (1200×1500) — أغلفة الكولكشنز، **من غير كلام** لأن الثيم بيكتب العنوان فوقها بالعربي والإنجليزي.
- `manifest.json` — فهرس بكل الملفات ومصدر كل صورة.
- موك-أب صفحة التصميم (`cz-*.webp`) موجودة بالفعل جوه `theme/assets` ومش محتاجة رفع منفصل.

**الرفع على Shopify**
1. **Products** ← افتح المنتج ← **Media** ← احذف الصور القديمة (أو سيبها بعد الجديدة) واسحب ملفات `NN.webp` بالترتيب 01، 02، 03…
2. **Products ← Collections** ← افتح الكولكشن ← **Collection image** ← ارفع ملف `-wide.webp`. (ملف `-tall` للموبايل/الستوري/الإعلانات.)
3. صور الحملة القديمة (السلاسل والخلفيات الحمرا) ما اتمسحتش — ممكن تفضل تستخدمها في البانرات.

**ملاحظة مهمة:** الهدوم نفسها **ما اتعدلتش خالص** — لا ألوان ولا طباعة ولا لوجو ولا شكل. اللي اتغير بس الخلفية والكادر وظل استوديو ناعم. (استثناء واحد: نقطة حمرا صغيرة من مؤثرات صورة الحملة كانت على بنطلون الموديل في anime-shirt-white رقم 01 واتشالت — مش على التيشيرت.)

## English

**What is this?** A consistent, premium studio image set for every LINUX product: the warm "LINUX Stone" backdrop, identical 1600×2000 (4:5) canvas, consistent head height, soft studio shadow.

- `products/<handle>/NN.webp` — main catalog images (01, 02, … in the same order as the original product media).
- `products/<handle>/dark/NN.webp` — **optional** alternates on the dark "LINUX Forest" backdrop with a subtle lime rim glow.
- `products/<handle>/cutout/NN.webp` — transparent cutouts (ads, social, design work).
- `collections/<handle>-wide.webp` (1600×1200) and `-tall.webp` (1200×1500) — collection covers with **no text** (the theme overlays localized titles).
- `manifest.json` — index of every file with its source image.
- The customize-studio mockups (`cz-*.webp`) already live in `theme/assets`; nothing to upload.

**Uploading in Shopify**
1. **Products** → open the product → **Media** → remove (or move after) the old images and drag in the `NN.webp` files in order 01, 02, 03…
2. **Products → Collections** → open the collection → **Collection image** → upload the `-wide.webp` file (use `-tall` for mobile, stories or ads).
3. The original campaign images (chains / red splatter) were not deleted; keep using them for banners if you like.

**Garments were not altered** — no recolouring, no print/logo changes, no reshaping. Only the background, framing and a soft studio shadow changed. (One exception: a tiny red speck from the campaign effects on the model's trousers in anime-shirt-white 01 was removed; the T-shirt itself is untouched.)
