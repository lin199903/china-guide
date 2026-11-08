(function () {
  "use strict";

  /* header state */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  /* tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  function activate(tab) {
    tabs.forEach(function (item) {
      var on = item === tab;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-selected", on ? "true" : "false");
      item.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (panel) {
      var on = panel.id === tab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activate(tab); });
    tab.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        next = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        next = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        next = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        next = tabs.length - 1;
      } else {
        return;
      }
      tabs[next].focus();
      activate(tabs[next]);
    });
  });

  /* Cal.com placeholder detection: hide broken demo iframe until the link is replaced */
  var calendar = document.querySelector("[data-calendar]");
  if (calendar) {
    var frame = calendar.querySelector("iframe");
    var src = frame ? (frame.getAttribute("src") || "") : "";
    var isPlaceholder = src.indexOf("china-guide/consultation") !== -1 || src.indexOf("YOUR_CAL") !== -1;
    calendar.classList.toggle("is-placeholder", isPlaceholder);
  }

  /* reveal on scroll */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* booking form */
  var form = document.getElementById("lead-form");
  if (!form) return;
  var status = document.getElementById("form-status");

  // Replace with the Turnstile site key from the Cloudflare dashboard.
  var SITE_KEY = "YOUR_TURNSTILE_SITE_KEY";
  var hasCaptcha = SITE_KEY.indexOf("YOUR_") !== 0 && SITE_KEY.length > 10;
  var widgetId = null;

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  var submitButton = form.querySelector('button[type="submit"]');
  if (!hasCaptcha) {
    submitButton.disabled = true;
    setStatus("Онлайн-форма временно недоступна. Напишите в Telegram.", "");
  }

  window.addEventListener("load", function () {
    if (!hasCaptcha || !window.turnstile) return;
    widgetId = window.turnstile.render("#turnstile", {
      sitekey: SITE_KEY,
      theme: "dark",
      language: "ru"
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!hasCaptcha) {
      setStatus("Онлайн-форма временно недоступна. Напишите в Telegram.", "error");
      return;
    }
    var data = new FormData(form);
    var payload = {
      name: String(data.get("name") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      topic: String(data.get("topic") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || "").trim(),
      consent: data.get("consent") === "on",
      token: ""
    };

    if (!payload.name || !payload.contact) {
      setStatus("Заполните имя и контакт.", "error");
      return;
    }
    if (!payload.consent) {
      setStatus("Нужно согласие с политикой конфиденциальности.", "error");
      return;
    }
    if (hasCaptcha) {
      if (!window.turnstile || !widgetId) {
        setStatus("Проверка безопасности ещё загружается. Подождите пару секунд.", "error");
        return;
      }
      payload.token = window.turnstile.getResponse(widgetId) || "";
      if (!payload.token) {
        setStatus("Подтвердите, что вы не робот.", "error");
        return;
      }
    }

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus("Отправляем…", "");

    try {
      var response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok) throw new Error(result.error || "send_failed");
      form.reset();
      if (hasCaptcha && window.turnstile && widgetId) window.turnstile.reset(widgetId);
      setStatus("Заявка отправлена. Свяжемся с вами в течение рабочего дня.", "ok");
    } catch (error) {
      setStatus("Не удалось отправить. Напишите нам в Telegram.", "error");
    } finally {
      button.disabled = false;
    }
  });
})();
