const WHATSAPP = "5500000000000";
const GREETING = "Olá! Vim pelo site e quero fazer um pedido.";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const menuBtn = document.querySelector("[data-menu-btn]");
const floatBtn = document.querySelector("[data-float]");
const footer = document.querySelector(".footer");
const slider = document.querySelector("[data-slider]");
const slides = [...slider.querySelectorAll(".slide")];
const dots = [...slider.querySelectorAll(".dot")];
const parallax = [...document.querySelectorAll("[data-parallax]")];
const spinners = [...document.querySelectorAll("[data-spin]")];
const track = document.querySelector("[data-track]");
const items = [...track.children];
const chips = [...document.querySelectorAll("[data-filter]")];
const arrows = [...document.querySelectorAll("[data-arrow]")];

const last = slides.length - 1;
const duration = reduceMotion ? 20 : 1100;

let current = 0;
let locked = false;
let movedAt = 0;

const atTop = () => window.scrollY < 4;
const menuOpen = () => header.classList.contains("is-open");

function sync() {
  slides.forEach((slide, i) => slide.setAttribute("aria-hidden", i !== current));
  dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  slider.classList.toggle("is-last", current === last);
}

function go(index) {
  const target = (index + slides.length) % slides.length;
  if (locked || target === current) return;

  locked = true;
  movedAt = Date.now();

  const from = slides[current];
  const to = slides[target];

  to.classList.add("is-entering");
  from.classList.add("is-leaving");
  void to.offsetWidth;
  to.classList.add("is-run");

  current = target;
  sync();

  setTimeout(() => {
    from.classList.remove("is-current", "is-leaving");
    to.classList.remove("is-entering", "is-run");
    to.classList.add("is-current");
    locked = false;
    movedAt = Date.now();
  }, duration);
}

window.addEventListener("wheel", (e) => {
  if (!atTop() || menuOpen() || Math.abs(e.deltaY) < 10) return;

  const down = e.deltaY > 0;
  const busy = locked || Date.now() - movedAt < 600;

  if (down && current === last) {
    if (busy) e.preventDefault();
    return;
  }

  if (!down && current === 0) return;

  e.preventDefault();
  if (!busy) go(down ? current + 1 : current - 1);
}, { passive: false });

window.addEventListener("keydown", (e) => {
  if (!atTop() || menuOpen()) return;

  const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
  const back = e.key === "ArrowUp" || e.key === "ArrowLeft";

  if (forward && current < last) {
    e.preventDefault();
    go(current + 1);
  }

  if (back && current > 0) {
    e.preventDefault();
    go(current - 1);
  }
});

let touchY = 0;

slider.addEventListener("touchstart", (e) => {
  touchY = e.touches[0].clientY;
}, { passive: true });

slider.addEventListener("touchend", (e) => {
  const diff = touchY - e.changedTouches[0].clientY;
  if (Math.abs(diff) < 50) return;

  if (diff > 0 && current < last) go(current + 1);
  if (diff < 0 && current > 0) go(current - 1);
}, { passive: true });

slider.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => go(current + 1));
});

dots.forEach((dot, i) => dot.addEventListener("click", () => go(i)));

slider.addEventListener("pointermove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  slider.style.setProperty("--mx", x.toFixed(3));
  slider.style.setProperty("--my", y.toFixed(3));
});

function setMenu(open) {
  header.classList.toggle("is-open", open);
  document.body.classList.toggle("no-scroll", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

menuBtn.addEventListener("click", () => setMenu(!menuOpen()));

header.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen()) setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860 && menuOpen()) setMenu(false);
});

document.querySelectorAll("[data-whats]").forEach((el) => {
  const item = el.dataset.whats;
  const text = item ? `Olá! Quero pedir um ${item}. Pode me ajudar?` : GREETING;

  el.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

function updateArrows() {
  const max = track.scrollWidth - track.clientWidth - 4;
  arrows.forEach((btn) => {
    const dir = Number(btn.dataset.arrow);
    btn.disabled = dir < 0 ? track.scrollLeft <= 4 : track.scrollLeft >= max;
  });
}

function applyFilter(cat) {
  let n = 0;

  items.forEach((item) => {
    const show = cat === "todos" || item.dataset.cat === cat;
    item.hidden = !show;
    if (show) item.dataset.tone = n++ % 3;
  });

  chips.forEach((chip) => {
    const active = chip.dataset.filter === cat;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", active);
  });

  track.scrollTo({ left: 0, behavior: "instant" });
  updateArrows();
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
});

document.querySelectorAll("[data-cat-link]").forEach((link) => {
  link.addEventListener("click", () => applyFilter(link.dataset.catLink));
});

arrows.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = items.find((item) => !item.hidden);
    const step = card ? card.offsetWidth + 24 : 300;
    track.scrollBy({ left: Number(btn.dataset.arrow) * step, behavior: "smooth" });
  });
});

track.addEventListener("scroll", updateArrows, { passive: true });
window.addEventListener("resize", updateArrows);

let ticking = false;

function update() {
  const y = window.scrollY;

  header.classList.toggle("is-solid", y > 40);
  const footerTop = footer.getBoundingClientRect().top;
  const pastHero = y > window.innerHeight * 0.7;
  floatBtn.classList.toggle("is-visible", pastHero && footerTop > window.innerHeight - 40);

  if (!reduceMotion) {
    spinners.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.rotate = `${(rect.top * parseFloat(el.dataset.spin)).toFixed(1)}deg`;
    });

    parallax.forEach((el) => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const p = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = `translate3d(0, ${(p * -70).toFixed(1)}px, 0)`;
    });
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}, { passive: true });

applyFilter("todos");
sync();
update();