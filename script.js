(function () {
  var TIMEOUT_MS = 5000;
  var SPINNER_COLOR = '#414bf9';
  var startTime = Date.now();

  function injectSpinner(formEl) {
    try {
      if (!document.getElementById('zi-spin-style')) {
        var s = document.createElement('style');
        s.id = 'zi-spin-style';
        s.textContent = '@keyframes zi-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(s);
      }
      formEl.style.position = 'relative';
      var overlay = document.createElement('div');
      overlay.className = 'zi-form-overlay';
      overlay.style.cssText = 'visibility:visible;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,0.95);z-index:9999;border-radius:8px;gap:12px';
      overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #e0e0e0;border-top-color:' + SPINNER_COLOR + ';border-radius:50%;animation:zi-spin 0.75s linear infinite"></div><span style="font-size:13px;color:#888;font-family:sans-serif">Loading form...</span>';
      formEl.parentElement.appendChild(overlay);
    } catch (e) {}
  }

  function removeSpinner(formEl) {
    try {
      formEl.style.visibility = 'visible';
      var overlay = formEl.parentElement.querySelector('.zi-form-overlay');
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }
    } catch (e) {
      try { formEl.style.visibility = 'visible'; } catch (e2) {}
    }
  }

  function waitForZIMapped(formEl) {
    var start = Date.now();
    function check() {
      try {
        if (formEl.hasAttribute('data-zi-mapped-form')) {
          removeSpinner(formEl);
          return;
        }
        if (Date.now() - start >= TIMEOUT_MS) {
          removeSpinner(formEl);
          return;
        }
        setTimeout(check, 100);
      } catch (e) {
        removeSpinner(formEl);
      }
    }
    check();
  }

  function init() {
    try {
      if (typeof window.MktoForms2 === 'undefined') {
        if (Date.now() - startTime < TIMEOUT_MS) setTimeout(init, 100);
        return;
      }
      window.MktoForms2.whenRendered(function (form) {
        var formEl;
        try {
          formEl = form.getFormElem()[0];
          var wrapper = formEl.closest('.marketoform_wrapper');

          // Caso 1: formulario tipo selector — no tocar nada
          if (wrapper && wrapper.querySelector('select')) {
            return;
          }

          // Caso 2 y 3: ocultar hasta procesarse o timeout
          formEl.style.visibility = 'hidden';
          injectSpinner(formEl);
          waitForZIMapped(formEl);
        } catch (e) {
          if (formEl) formEl.style.visibility = 'visible';
        }
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
