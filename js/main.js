// Vanilla-JS replacement for the behaviour of the React app:
// theme toggle, mobile menu, lazy images/video and the footer/year bits.
(function () {
  "use strict";

  // ------------------------------------------------------------ theme (Navbar.js)
  // localStorage "theme" is JSON; anything falsy (including "no value yet") means dark.
  function readTheme() {
    try {
      return JSON.parse(localStorage.getItem("theme"));
    } catch (e) {
      return null;
    }
  }

  function setThemeColors(theme) {
    var s = document.documentElement.style;
    s.setProperty("--textColor", theme ? "black" : "white");
    s.setProperty("--bgColor", theme ? "white" : "black");
    s.setProperty("--titleColor", theme ? "rgb(6 95 70)" : "rgb(68 147 91)");
    s.setProperty("--containerColor", theme ? "lightgrey" : "rgb(20 20 20)");
  }

  // elements whose classes depend on the theme
  function applyThemeClasses(theme) {
    // navbar icon is inverted in light mode, footer icons are inverted in dark mode
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.classList.toggle("invert", !!theme);
    });
    document.querySelectorAll(".footer-icon").forEach(function (el) {
      el.classList.toggle("invert", !theme);
    });
    document.querySelectorAll("[data-sponsors-bg]").forEach(function (el) {
      el.classList.toggle("bg-slate-100", !!theme);
      el.classList.toggle("bg-[#141414]", !theme);
    });
  }

  var theme = readTheme();
  setThemeColors(theme);
  applyThemeClasses(theme);

  document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
    el.addEventListener("click", function () {
      theme = !theme;
      setThemeColors(theme);
      applyThemeClasses(theme);
      localStorage.setItem("theme", theme);
    });
  });

  // ------------------------------------------------------------ mobile menu (useIsMobile.js)
  var menu = document.getElementById("nav-menu");
  var OPEN = ["top-[0]", "opacity-100"];
  var CLOSED = ["top-[-440%]", "opacity-0"];
  var isMobile = function () {
    return window.innerWidth <= 640;
  };
  var showMenu = !isMobile();

  function renderMenu() {
    if (!menu) return;
    (showMenu ? CLOSED : OPEN).forEach(function (c) {
      menu.classList.remove(c);
    });
    (showMenu ? OPEN : CLOSED).forEach(function (c) {
      menu.classList.add(c);
    });
  }

  if (menu) {
    renderMenu();
    // enable the slide transition only after the initial state is applied, so it does not animate on load
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        menu.classList.add("transition-all");
      });
    });
    window.addEventListener("resize", function () {
      showMenu = !isMobile();
      renderMenu();
    });
    document.querySelectorAll("[data-menu-toggle]").forEach(function (el) {
      el.addEventListener("click", function () {
        showMenu = !showMenu;
        renderMenu();
      });
    });
  }

  // ------------------------------------------------------------ lazy images (LazyImage.js)
  function observe(selector, options, onVisible) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(onVisible);
      return;
    }
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          onVisible(entry.target);
        }
      });
    }, options);
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  observe("img[data-lazy-src]", undefined, function (img) {
    img.alt = img.getAttribute("data-lazy-alt") || "";
    img.removeAttribute("style");
    img.src = img.getAttribute("data-lazy-src");
  });

  // ------------------------------------------------------------ lazy video + play/pause (LazyVideo.js)
  observe("video[data-lazy-src]", { root: null, rootMargin: "0px", threshold: 0.1 }, function (video) {
    video.src = video.getAttribute("data-lazy-src");
  });

  document.querySelectorAll("[data-video-toggle]").forEach(function (button) {
    var video = button.parentElement.querySelector("video");
    var pauseIcon = button.querySelector("[data-icon-pause]");
    var playIcon = button.querySelector("[data-icon-play]");
    var isPlaying = false; // mirrors the React state (shows the pause icon first)
    button.addEventListener("click", function () {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      isPlaying = !isPlaying;
      // SVG elements have no .hidden property, so toggle the attribute
      playIcon.toggleAttribute("hidden", !isPlaying);
      pauseIcon.toggleAttribute("hidden", isPlaying);
    });
  });

  // ------------------------------------------------------------ footer / dynamic year
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = year;
  });
  document.querySelectorAll("[data-site-url]").forEach(function (el) {
    el.href = window.location.protocol + "//" + window.location.host;
  });
})();
