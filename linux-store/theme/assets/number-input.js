/* Display Arabic-Indic digits over native numeric fields without changing their values. */
(function () {
  'use strict';

  const DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const displays = new WeakMap();
  const format = (value) => String(value ?? '').replace(/[0-9]/g, (digit) => DIGITS[Number(digit)]);
  const arabic = () => (document.documentElement?.lang || '').toLowerCase().startsWith('ar');

  function sync(input) {
    const display = displays.get(input);
    if (display) display.textContent = format(input.value);
  }

  function enhance(input) {
    if (input.type !== 'number' || !input.hasAttribute('data-localized-number') || input.dataset.numberDisplayReady) return;
    if (!arabic()) {
      input.dataset.numberDisplayReady = '1';
      return;
    }
    if (!input.parentNode) return;

    const wrapper = document.createElement('span');
    wrapper.className = 'number-input';
    const display = document.createElement('span');
    display.className = 'number-input__display';
    display.setAttribute('aria-hidden', 'true');

    const style = window.getComputedStyle(input);
    display.style.font = style.font;
    display.style.letterSpacing = style.letterSpacing;
    display.style.lineHeight = style.lineHeight;
    display.style.color = style.color;
    display.style.justifyContent = style.textAlign === 'left' || style.textAlign === 'start' ? 'flex-start'
      : style.textAlign === 'right' || style.textAlign === 'end' ? 'flex-end' : 'center';

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(display);
    displays.set(input, display);
    input.dataset.numberDisplayReady = '1';
    input.addEventListener('input', () => sync(input));
    input.addEventListener('change', () => sync(input));
    sync(input);
  }

  function scan(root) {
    if (root.matches?.('[data-localized-number]')) enhance(root);
    root.querySelectorAll?.('[data-localized-number]').forEach(enhance);
  }

  const linux = window.LINUX || (window.LINUX = {});
  linux.numberInputs = Object.assign(linux.numberInputs || {}, { format, enhance, sync });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document), { once: true });
  else scan(document);

  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('[data-qty-change], [data-qty-step], [data-cz-qty-step]');
    const input = button?.closest('.qty')?.querySelector('[data-localized-number]');
    if (input) queueMicrotask(() => sync(input));
  });

  if (typeof MutationObserver === 'function' && document.documentElement) {
    const observer = new MutationObserver((records) => records.forEach((record) => {
      if (record.type === 'attributes') enhance(record.target);
      record.addedNodes?.forEach((node) => { if (node.nodeType === 1) scan(node); });
    }));
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-localized-number'] });
  }
})();
