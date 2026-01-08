/* =========================
   AUREA STATE — JS (ES6+)
   - Progressive enhancement
   - Scroll reveal
   - Parallax (subtle)
   - Mobile menu
   - Optional luxury cursor
   ========================= */

(() => {
  // Year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile menu
  const burger = document.querySelector("[data-burger]");
  const mobile = document.querySelector("[data-mobile]");

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));

      if (open) {
        mobile.hidden = true;
      } else {
        mobile.hidden = false;
      }
    });

    // Close on link click
    mobile.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobile.hidden = true;
      });
    });
  }

  // Scroll reveal (IntersectionObserver)
  const revealEls = [...document.querySelectorAll("[data-reveal]")];

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealEls.forEach((el) => {
    // Hero já aparece sem JS, mas ainda podemos animar detalhes
    if (el.getAttribute("data-reveal") === "hero") return;
    io.observe(el);
  });

  // Parallax (subtle, performant with rAF)
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (parallaxEls.length) {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const vh = window.innerHeight || 800;
        parallaxEls.forEach((el) => {
          const speed = Number(el.getAttribute("data-parallax") || 0.1);
          const rect = el.getBoundingClientRect();
          const progress = (rect.top - vh * 0.5) / vh; // -0.5..0.5 aprox.
          const translate = progress * -40 * speed; // sutil
          el.style.transform = `translate3d(0, ${translate}px, 0)`;
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Luxury cursor (optional)
  const cursor = document.querySelector(".lux-cursor");
  const finePointer = window.matchMedia && window.matchMedia("(pointer:fine)").matches;

  if (cursor && finePointer) {
    document.documentElement.classList.add("cursor-on");

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;

    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const raf = () => {
      // suaviza o movimento
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(raf);
    };

    window.addEventListener("mousemove", move, { passive: true });
    requestAnimationFrame(raf);

    // Cursor states
    const setState = (stateOn) => {
      document.documentElement.classList.toggle("cursor-cta", stateOn);
    };

    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const kind = el.getAttribute("data-cursor");
        setState(kind === "cta");
      });
      el.addEventListener("mouseleave", () => setState(false));
    });
  }
})();
/* =========================
   Video Modal
   ========================= */
const videoModal = document.querySelector("[data-video-modal]");
const openVideo = document.querySelector("[data-video-open]");
const closeVideoEls = document.querySelectorAll("[data-video-close]");

if (videoModal && openVideo) {
  openVideo.addEventListener("click", () => {
    videoModal.hidden = false;
    document.body.style.overflow = "hidden";
  });

  closeVideoEls.forEach(el =>
    el.addEventListener("click", () => {
      videoModal.hidden = true;
      document.body.style.overflow = "";
      const iframe = videoModal.querySelector("iframe");
      iframe.src = iframe.src; // stop video
    })
  );
}
/* =========================
   Slider (Mobile / Touch)
   ========================= */
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = [...slider.querySelectorAll(".card")];
  if (slides.length < 2) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let autoTimer = null;
  let resumeTimer = null;
  let isAutoScrolling = false;

  const getClosestIndex = () => {
    let closest = 0;
    let min = Infinity;
    slides.forEach((slide, index) => {
      const diff = Math.abs(slide.offsetLeft - slider.scrollLeft);
      if (diff < min) {
        min = diff;
        closest = index;
      }
    });
    return closest;
  };

  const scrollToIndex = (index) => {
    const target = slides[index];
    if (!target) return;
    slider.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const startAuto = () => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(max-width: 980px)").matches) return;
    if (autoTimer) return;

    autoTimer = setInterval(() => {
      const next = (getClosestIndex() + 1) % slides.length;
      isAutoScrolling = true;
      scrollToIndex(next);
      setTimeout(() => {
        isAutoScrolling = false;
      }, 600);
    }, 4500);
  };

  const scheduleResume = () => {
    if (prefersReducedMotion) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, 5000);
  };

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("dragging");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    stopAuto();
  });

  slider.addEventListener("mouseleave", () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove("dragging");
    scheduleResume();
  });

  slider.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove("dragging");
    scheduleResume();
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener("touchstart", () => {
    stopAuto();
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    scheduleResume();
  }, { passive: true });

  slider.addEventListener("touchcancel", () => {
    scheduleResume();
  }, { passive: true });

  slider.addEventListener("scroll", () => {
    if (isAutoScrolling) return;
    stopAuto();
    scheduleResume();
  }, { passive: true });

  window.addEventListener("resize", () => {
    stopAuto();
    startAuto();
  });

  startAuto();
});
