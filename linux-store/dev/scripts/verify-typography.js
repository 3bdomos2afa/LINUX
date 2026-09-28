// Run with agent-browser eval after navigating to a storefront page.
(async () => {
  await document.fonts.ready;
  const ar = document.documentElement.lang === 'ar';
  // Expected families come from the active font preset (snippets/fonts.liquid).
  const rootStyle = getComputedStyle(document.documentElement);
  const family = (name) => rootStyle.getPropertyValue(name).split(',')[0].trim().replaceAll('"', '');
  const headingFont = family('--font-display');
  const bodyFont = family('--font-body');
  const accentFont = family('--font-accent');
  const headingWeight = rootStyle.getPropertyValue('--w-heading').trim();
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  const firstFont = (style) => style.fontFamily.split(',')[0].trim().replaceAll('"', '');
  const visible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  // Resolve a colour token in a given context (section colour schemes redefine it).
  const token = (name, context = document.body) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    context.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  };
  const headingColor = token('--heading');
  const bodyColor = token('--fg');
  const bodyStyle = getComputedStyle(document.body);
  check(firstFont(bodyStyle) === bodyFont, `Body font: ${bodyStyle.fontFamily}`);
  check(bodyStyle.color === bodyColor, `Body color: ${bodyStyle.color}`);
  if (document.documentElement.dataset.scheme !== 'light') check(bodyColor === 'rgb(255, 255, 255)', 'Dark-scheme copy must be white');
  check(document.documentElement.dir === (ar ? 'rtl' : 'ltr'), 'Document direction');
  check(document.documentElement.scrollWidth <= innerWidth + 1, `Page overflow: ${document.documentElement.scrollWidth}/${innerWidth}`);
  check(!/translation missing/i.test(document.body.innerText), 'Missing translated copy');

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  for (const element of headings) {
    const style = getComputedStyle(element);
    const label = element.textContent.trim().slice(0, 70);
    check(firstFont(style) === headingFont, `${label}: heading font ${style.fontFamily}`);
    const expectedColor = token('--heading', element.parentElement || document.body);
    check(style.color === expectedColor, `${label}: heading color ${style.color} (expected ${expectedColor})`);
    if (ar) {
      check(style.fontWeight === headingWeight, `${label}: heading weight ${style.fontWeight} (expected ${headingWeight})`);
      check(style.letterSpacing === 'normal' || parseFloat(style.letterSpacing) === 0, `${label}: Arabic tracking`);
    }
  }

  const numbers = [...document.querySelectorAll('.price__current,.price__compare,.money,.qty__input,[data-cd],[data-cart-count],.cz__breakdown')].filter(visible);
  for (const element of numbers) {
    const style = getComputedStyle(element);
    check(firstFont(style) === bodyFont, `Number font ${element.className}: ${style.fontFamily}`);
  }
  for (const family of new Set([bodyFont, ...(headings.length ? [headingFont] : [])])) {
    check([...document.fonts].some((face) => face.family.replaceAll('"', '') === family && face.status === 'loaded'), `${family} did not load`);
  }
  if (ar) {
    for (const element of document.body.querySelectorAll('*')) {
      if (element.closest('svg,script,style') || !visible(element)) continue;
      if (![...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue;
      check([bodyFont, headingFont, accentFont].includes(firstFont(getComputedStyle(element))), `Arabic text font: ${element.className || element.tagName}`);
    }
    const canvas = document.createElement('canvas').getContext('2d');
    const widths = (family) => {
      canvas.font = `400 40px ${family}`;
      return ['٠١٢٣٤٥٦٧٨٩', '0123456789'].map((sample) => canvas.measureText(sample).width);
    };
    const branded = widths(`"${bodyFont}"`);
    const fallback = widths('sans-serif');
    check(branded.every((width, index) => Math.abs(width - fallback[index]) > 1), 'Digit glyphs fell back to the system font');
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return { path: location.pathname, locale: document.documentElement.lang, viewport: innerWidth, headings: headings.length, numericElements: numbers.length, headingFont, bodyFont, headingColor, bodyColor, passed: true };
})();
