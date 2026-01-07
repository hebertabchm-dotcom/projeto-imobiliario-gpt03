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
   Drag Slider (Mobile)
   ========================= */
document.querySelectorAll("[data-slider]").forEach(slider => {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", e => {
    isDown = true;
    slider.classList.add("dragging");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => isDown = false);
  slider.addEventListener("mouseup", () => isDown = false);

  slider.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });
});
