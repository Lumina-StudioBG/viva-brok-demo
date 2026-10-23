(() => {
  'use strict';
  const products = {
    liability: { name: 'Гражданска отговорност', category: 'car', description: 'За отговорността ви на пътя и спокойствието зад волана.', tip: 'Подгответе въпросите си за условията на полицата и периода, за който търсите защита.' },
    casco: { name: 'Каско', category: 'car', description: 'Повече грижа за автомобила, който ви отвежда напред.', tip: 'Помислете какво покритие търсите за автомобила си и кои условия искате да уточните.' },
    property: { name: 'Имуществени', category: 'home', description: 'За мястото, което наричате дом, и всичко ценно в него.', tip: 'Подредете какво искате да защитите: самия имот, вещите в него или и двете.' },
    medical: { name: 'Медицински', category: 'life', description: 'Грижа за здравето, съобразена с вашите нужди.', tip: 'Помислете за кого търсите застраховката и какви въпроси имате за включените медицински услуги.' },
    life: { name: 'Живот', category: 'life', description: 'С мисъл за вас и финансовото бъдеще на близките ви.', tip: 'Помислете за вашите дългосрочни цели и за въпросите, които искате да обсъдите с консултант.' },
    pension: { name: 'Пенсионни', category: 'life', description: 'За плановете, които искате да продължите да сбъдвате.', tip: 'Подредете въпросите си за дългосрочните цели, условията и вариантите, които искате да разгледате.' }
  };
  const stages = { new: 'Търся нова застраховка', renew: 'Искам да подновя полица', explore: 'Още се ориентирам' };
  const priorities = { coverage: 'По-широко покритие', budget: 'Бюджетът ми', clarity: 'Да разбера възможностите' };
  const quoteDialog = document.getElementById('quote-dialog');
  const privacyDialog = document.getElementById('privacy-dialog');
  const form = document.getElementById('quote-form');
  const insuranceSelect = document.getElementById('insurance-type');
  const formView = document.getElementById('quote-form-view');
  const summaryView = document.getElementById('quote-summary-view');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  let lastTrigger = null;
  let currentSummary = null;

  function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Затворете менюто' : 'Отворете менюто');
    mobileNav.hidden = !open;
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); menuToggle.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let visible = 0;
      document.querySelectorAll('[data-filter]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('.product-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      document.getElementById('filter-status').textContent = visible === 1 ? 'Показана е 1 застраховка.' : `Показани са ${visible} застраховки.`;
    });
  });

  function updateProductContext() {
    document.getElementById('product-context').textContent = products[insuranceSelect.value]?.description || 'Започнете с това, което искате да защитите.';
  }
  function showForm() {
    formView.hidden = false;
    summaryView.hidden = true;
    quoteDialog.setAttribute('aria-labelledby', 'quote-title');
    quoteDialog.setAttribute('aria-describedby', 'quote-intro');
    quoteDialog.scrollTop = 0;
  }
  function openQuote(product, trigger) {
    lastTrigger = trigger;
    setMenu(false);
    showForm();
    if (products[product]) insuranceSelect.value = product;
    updateProductContext();
    quoteDialog.showModal();
    document.body.classList.add('dialog-open');
    insuranceSelect.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-open-quote]').forEach(button => {
    button.addEventListener('click', () => openQuote(button.dataset.openQuote || '', button));
  });
  insuranceSelect.addEventListener('change', updateProductContext);

  [quoteDialog, privacyDialog].forEach(dialog => {
    dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (lastTrigger && document.contains(lastTrigger)) {
        if (mobileNav.contains(lastTrigger) && mobileNav.hidden) menuToggle.focus();
        else lastTrigger.focus({ preventScroll: true });
      }
    });
  });
  document.getElementById('privacy-open').addEventListener('click', event => {
    lastTrigger = event.currentTarget;
    privacyDialog.showModal();
    document.body.classList.add('dialog-open');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const product = products[values.get('insurance')];
    const stage = stages[values.get('stage')];
    const priority = priorities[values.get('priority')];
    if (!product || !stage || !priority) return;
    currentSummary = { product: product.name, stage, priority, tip: product.tip };
    document.getElementById('summary-product').textContent = product.name;
    document.getElementById('summary-stage').textContent = stage;
    document.getElementById('summary-priority').textContent = priority;
    document.getElementById('summary-tip').textContent = product.tip;
    formView.hidden = true;
    summaryView.hidden = false;
    quoteDialog.setAttribute('aria-labelledby', 'summary-title');
    quoteDialog.removeAttribute('aria-describedby');
    quoteDialog.scrollTop = 0;
    document.getElementById('summary-title').focus({ preventScroll: true });
  });
  document.getElementById('edit-selection').addEventListener('click', () => {
    showForm();
    insuranceSelect.focus({ preventScroll: true });
  });
  document.getElementById('download-summary').addEventListener('click', () => {
    if (!currentSummary) return;
    const text = [
      'СИГУРНО. — ВАШИТЕ ПРЕДПОЧИТАНИЯ', '',
      `Застраховка: ${currentSummary.product}`,
      `Текуща нужда: ${currentSummary.stage}`,
      `Основен приоритет: ${currentSummary.priority}`, '',
      'За следващата стъпка:', currentSummary.tip, '',
      'Това е примерен преглед от дизайн концепция. Не е изпратено запитване и не е сключена полица.'
    ].join('\n');
    const blob = new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sigurno-moyat-izbor.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
  document.getElementById('current-year').textContent = String(new Date().getFullYear());
})();
