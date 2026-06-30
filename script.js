(function () {
  var TIMEOUT_MS = 5000;
  var SPINNER_COLOR = '#414bf9';
  var startTime = Date.now();

  function injectSpinner(wrapper) {
    try {
      if (!document.getElementById('zi-spin-style')) {
        var s = document.createElement('style');
        s.id = 'zi-spin-style';
        s.textContent = '@keyframes zi-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(s);
      }
      wrapper.style.position = 'relative';
      wrapper.style.overflow = 'hidden';
      var overlay = document.createElement('div');
      overlay.id = 'zi-form-overlay';
      overlay.style.cssText = 'visibility:visible;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,0.95);z-index:9999;border-radius:8px;gap:12px';
      overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #e0e0e0;border-top-color:' + SPINNER_COLOR + ';border-radius:50%;animation:zi-spin 0.75s linear infinite"></div><span style="font-size:13px;color:#888;font-family:sans-serif">Loading form...</span>';
      wrapper.appendChild(overlay);
    } catch (e) {}
  }

  function removeSpinner(wrapper) {
    try {
      var overlay = wrapper.querySelector('#zi-form-overlay');
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }
      wrapper.style.visibility = 'visible';
    } catch (e) {
      try { wrapper.style.visibility = 'visible'; } catch (e2) {}
    }
  }

  function waitForZIMapped(formEl, wrapper) {
    var start = Date.now();
    function check() {
      try {
        if (formEl.hasAttribute('data-zi-mapped-form')) {
          removeSpinner(wrapper);
          return;
        }
        if (Date.now() - start >= TIMEOUT_MS) {
          removeSpinner(wrapper);
          return;
        }
        setTimeout(check, 100);
      } catch (e) {
        removeSpinner(wrapper);
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
        try {
          var formEl = form.getFormElem()[0];
          var wrapper = formEl.closest('.marketoform_wrapper');
          if (!wrapper) return;
          wrapper.style.visibility = 'hidden';
          injectSpinner(wrapper);
          waitForZIMapped(formEl, wrapper);
        } catch (e) {
          if (wrapper) wrapper.style.visibility = 'visible';
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
