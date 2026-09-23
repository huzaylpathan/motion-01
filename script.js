document.body.classList.add("is-loading");

const loader = document.querySelector(".loader");
const loaderNumber = document.querySelector(".loader-number");
const progress = document.querySelector(".progress i");
const nav = document.querySelector(".nav");
const cursor = document.querySelector(".cursor");
const cursorLabel = cursor?.querySelector("span");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runLoader() {
  if (!loaderNumber) {
    loader?.classList.add("done");
    document.body.classList.remove("is-loading");
    return;
  }
  if (reducedMotion) {
    loaderNumber.textContent = "100";
    loader?.classList.add("done");
    document.body.classList.remove("is-loading");
    return;
  }
  const duration = 1900;
  const startTime = performance.now();
  function updateLoader(currentTime) {
    const elapsed = currentTime - startTime;
    const progressValue = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const value = Math.min(100, Math.floor(eased * 100));
    loaderNumber.textContent = String(value).padStart(2, "0");
    if (progressValue < 1) {
      requestAnimationFrame(updateLoader);
    } else {
      loaderNumber.textContent = "100";
      setTimeout(() => {
        loader?.classList.add("done");
        document.body.classList.remove("is-loading");
      }, 180);
    }
  }
  requestAnimationFrame(updateLoader);
}

if (document.readyState === "complete") {
  runLoader();
} else {
  window.addEventListener("load", runLoader, { once: true });
}

if (finePointer && !reducedMotion) {
  document.body.classList.add("has-custom-cursor");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const cursorPos = { x: mouse.x, y: mouse.y };
  window.addEventListener("pointermove", event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
  function animateCursor() {
    cursorPos.x += (mouse.x - cursorPos.x) * 0.18;
    cursorPos.y += (mouse.y - cursorPos.y) * 0.18;
    if (cursor) cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll("[data-cursor]").forEach(element => {
    element.addEventListener("mouseenter", () => {
      cursor?.classList.add("view");
      if (cursorLabel) cursorLabel.textContent = element.dataset.cursor;
    });
    element.addEventListener("mouseleave", () => cursor?.classList.remove("view"));
  });
  document.querySelectorAll(".magnetic").forEach(element => {
    element.addEventListener("pointermove", event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => element.style.transform = "");
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal, .reveal-image, .human").forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll("main section[id]")];
const indexLinks = [...document.querySelectorAll(".index a")];

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    indexLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { threshold: 0.45 });

sections.forEach(section => sectionObserver.observe(section));

function scrollEffects() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progressValue = max > 0 ? scrollY / max : 0;
  if (progress) progress.style.height = `${progressValue * 100}%`;
  nav?.classList.toggle("scrolled", scrollY > 40);
  if (!reducedMotion) {
    document.querySelectorAll("[data-speed]").forEach(element => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - innerHeight / 2;
      const shift = center * Number(element.dataset.speed);
      element.style.transform = `translate3d(0, ${shift}px, 0) scale(1.06)`;
    });
    document.querySelectorAll("[data-parallax]").forEach(element => {
      const shift = scrollY * Number(element.dataset.parallax);
      element.style.transform = `translate3d(${shift}px, 0, 0)`;
    });
  }
}
window.addEventListener("scroll", scrollEffects, { passive: true });
scrollEffects();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const targetSelector = link.getAttribute("href");
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    closeNav();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});

const techData = {
  sensors: ["SENSOR / 360°", "READY"],
  software: ["SOFTWARE / CORE", "ADAPT"],
  interface: ["INTERFACE / 01", "CONTROL"]
};
const techCode = document.getElementById("techCode");
const techValue = document.getElementById("techValue");

document.querySelectorAll(".tech-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".tech-item").forEach(other => {
      other.classList.remove("active");
      other.setAttribute("aria-selected", "false");
    });
    item.classList.add("active");
    item.setAttribute("aria-selected", "true");
    const data = techData[item.dataset.tech];
    if (data && techCode && techValue) {
      techCode.textContent = data[0];
      techValue.textContent = data[1];
    }
  });
});

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    if (reducedMotion) {
      element.textContent = target.toFixed(decimals);
      counterObserver.unobserve(element);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 4);
      element.textContent = (target * eased).toFixed(decimals);
      if (progressValue < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = target.toFixed(decimals);
      }
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.7 });

document.querySelectorAll("[data-count]").forEach(element => counterObserver.observe(element));

const menuBtn = document.querySelector(".menu");
const navOverlay = document.getElementById("navOverlay");
const navCloseBtn = document.querySelector(".nav-close");
let lastFocused = null;

function openNav() {
  if (!navOverlay) return;
  lastFocused = document.activeElement;
  navOverlay.classList.add("open");
  navOverlay.setAttribute("aria-hidden", "false");
  menuBtn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("nav-open");
  navOverlay.querySelector("a")?.focus();
}

function closeNav() {
  if (!navOverlay || !navOverlay.classList.contains("open")) return;
  navOverlay.classList.remove("open");
  navOverlay.setAttribute("aria-hidden", "true");
  menuBtn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
  lastFocused?.focus();
}

menuBtn?.addEventListener("click", () => {
  navOverlay?.classList.contains("open") ? closeNav() : openNav();
});
navCloseBtn?.addEventListener("click", closeNav);

const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
let lightboxLastFocused = null;

function getImageSource(sourceElement) {
  if (!sourceElement) return null;
  const normalBackground = getComputedStyle(sourceElement).backgroundImage;
  if (normalBackground && normalBackground !== "none") return normalBackground;
  const beforeBackground = getComputedStyle(sourceElement, "::before").backgroundImage;
  if (beforeBackground && beforeBackground !== "none") return beforeBackground;
  const afterBackground = getComputedStyle(sourceElement, "::after").backgroundImage;
  if (afterBackground && afterBackground !== "none") return afterBackground;
  return null;
}

function openLightbox(sourceElement) {
  if (!lightbox || !lightboxImage) return;
  const imageSource = getImageSource(sourceElement);
  if (!imageSource || imageSource === "none") {
    console.warn("MOTION/01: No image source found for lightbox.", sourceElement);
    return;
  }
  lightboxLastFocused = document.activeElement;
  lightboxImage.style.backgroundImage = imageSource;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("nav-open");
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightbox.classList.contains("open")) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("nav-open");
  lightboxLastFocused?.focus();
}

document.querySelectorAll("[data-cursor]").forEach(element => {
  element.addEventListener("click", event => {
    if (event.target.closest("button, a")) return;
    openLightbox(element);
  });
  element.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(element);
    }
  });
});

lightboxClose?.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();
  closeLightbox();
});

lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeNav();
    closeLightbox();
  }
});

lightboxImage?.addEventListener("click", event => {
  event.stopPropagation();
});