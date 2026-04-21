const DEFAULT_NOTE =
`hey you`;

const DEFAULT_ITEMS = [
  { date: "17-23 March 2025", title: "the trip when we got close",           desc: "where it all started 😛😛",                    emoji: "✨", photos: ["images/sz1.jpeg", "images/pic10.jpeg"] },
  { date: "24 March 2025", title: "first date 😜😜",               desc: "CYCLELEE",   emoji: "🩷",        photos: ["images/date1.jpeg", "images/date2.jpeg"] },
  { date: "23 July 2025", title: "first photobooth 😙😙", desc: "hehe this so cute",                     emoji: "💫", photos: ["images/monthsary1.jpeg", "images/monthsary2.jpeg"] },
  { date: "1 April 2025", title: "our little adventure to JB",     desc: "SO FUNN",                    emoji: "🎀", photos: ["images/jb1.jpeg", "images/jb4.jpeg"] },
];

const GALLERY_SLIDES = [
  { src: "images/pic1.jpeg", caption: "CHAINSMOKERSSS" },
  { src: "images/pic2.jpeg", caption: "our first valentines hehe" },
  { src: "images/pic3.jpeg", caption: "so cutee" },
  { src: "images/pic4.jpeg", caption: "first fireworks together woof" },
  { src: "images/pic5.jpeg", caption: "FIRST MONTH HEHEHE" },
  { src: "images/pic6.jpeg", caption: "first festival RAHHH" },
  { src: "images/pic7.jpeg", caption: "HALLOWEEENNN" },
  { src: "images/pic8.jpeg", caption: "saur ke aii" },
  { src: "images/pic9.jpeg", caption: "our vivo date HAHAAHAHH" },
  { src: "images/pic10.jpeg", caption: "i miss shenzhen" },
];

/* State */

let items    = [];
let note     = DEFAULT_NOTE;
let galIndex = 0;
let tlEditing    = false;
let noteEditing  = false;

/* Persistence */

function loadState() {
  items = deepClone(DEFAULT_ITEMS);
  note = DEFAULT_NOTE;
}


function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* countdown  */

function renderCountdown() {
  const el  = document.getElementById("countdown");
  const now = new Date();
  const target = new Date(now.getFullYear(), 3, 23); // April = month 3
  if (now > target) target.setFullYear(now.getFullYear() + 1);

  if (now.getMonth() === 3 && now.getDate() === 23) {
    el.innerHTML = `
      <div class="cd-today">
        <div class="cd-today-main">🎉 HAPPY 1 YEAR!!</div>
        <div class="cd-today-sub">happy anniversary bestie (romantic version)</div>
      </div>`;
    return;
  }

  const diff = target - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000)  /    60_000);
  const s = Math.floor((diff %    60_000)  /     1_000);

  const pad = n => String(n).padStart(2, "0");

  el.innerHTML = `
    <div class="cd-box"><div class="cd-num">${d}</div><div class="cd-label">days</div></div>
    <span class="cd-sep">:</span>
    <div class="cd-box"><div class="cd-num">${pad(h)}</div><div class="cd-label">hrs</div></div>
    <span class="cd-sep">:</span>
    <div class="cd-box"><div class="cd-num">${pad(m)}</div><div class="cd-label">min</div></div>
    <span class="cd-sep">:</span>
    <div class="cd-box"><div class="cd-num">${pad(s)}</div><div class="cd-label">sec</div></div>`;
}

/* Gallery carousel  */
function renderGallery() {
  const track = document.getElementById("carousel-track");
  const dots  = document.getElementById("car-dots");

  track.innerHTML = GALLERY_SLIDES.map((slide, i) => `
    <div class="car-slide">
      ${slide.src
        ? `<img src="${esc(slide.src)}" alt="${esc(slide.caption)}" />`
        : `<div class="car-slide-placeholder">
             <div class="car-placeholder-icon">📷</div>
             <div class="car-placeholder-label">photo ${i + 1}</div>
             <div class="car-placeholder-sub">add your image src in app.js</div>
           </div>`}
      <div class="car-caption">
        <span class="car-caption-text">${esc(slide.caption)}</span>
        <span class="car-caption-num">${i + 1} / ${GALLERY_SLIDES.length}</span>
      </div>
    </div>
  `).join("");

  dots.innerHTML = GALLERY_SLIDES.map((_, i) =>
    `<button class="dot${i === galIndex ? " active" : ""}" aria-label="slide ${i+1}" onclick="goSlide(${i})"></button>`
  ).join("");

  goSlide(galIndex, false);
}

function goSlide(n, animate = true) {
  galIndex = Math.max(0, Math.min(n, GALLERY_SLIDES.length - 1));
  const track = document.getElementById("carousel-track");
  track.style.transition = animate ? "transform 0.38s cubic-bezier(.4,0,.2,1)" : "none";
  track.style.transform  = `translateX(-${galIndex * 100}%)`;
  document.querySelectorAll(".dot").forEach((d, i) =>
    d.classList.toggle("active", i === galIndex)
  );
}

function initGallery() {
  document.getElementById("car-prev").addEventListener("click", () => goSlide(galIndex - 1));
  document.getElementById("car-next").addEventListener("click", () => goSlide(galIndex + 1));
}

/* timeline  */

function renderTimeline() {
  const container = document.getElementById("tl-items");

  container.innerHTML = items.map((item, i) => {
    if (tlEditing) {
      return `
        <div class="tl-item editing" id="tl-${i}">
          <div class="tl-dot"></div>
          <button class="del-btn" onclick="deleteItem(${i})" title="remove">✕</button>
          <div class="tl-edit-fields">
            <div class="tl-edit-row">
              <input type="text" class="tl-emoji-input" value="${esc(item.emoji)}" placeholder="💕" data-field="emoji" data-idx="${i}" />
              <input type="text" value="${esc(item.date)}" placeholder="date..." data-field="date" data-idx="${i}" />
            </div>
            <input type="text" value="${esc(item.title)}" placeholder="title..." data-field="title" data-idx="${i}" style="font-weight:700" />
            <textarea rows="2" placeholder="description..." data-field="desc" data-idx="${i}">${esc(item.desc)}</textarea>
          </div>
          ${photosHtml(i, true)}
        </div>`;
    } else {
      return `
        <div class="tl-item" id="tl-${i}">
          <div class="tl-dot"></div>
          <div class="tl-meta">
            <span class="tl-date-pill">${esc(item.date)}</span>
            <span class="tl-emoji">${item.emoji}</span>
          </div>
          <div class="tl-title">${esc(item.title)}</div>
          <div class="tl-desc">${esc(item.desc)}</div>
          ${photosHtml(i, false)}
        </div>`;
    }
  }).join("");

  // wire up live input sync in edit mode
  if (tlEditing) {
    container.querySelectorAll("input[data-field], textarea[data-field]").forEach(el => {
      el.addEventListener("input", () => {
        const idx   = +el.dataset.idx;
        const field = el.dataset.field;
        items[idx][field] = el.value;
      });
    });
  }


}

function photosHtml(itemIdx, editing) {
  const item = items[itemIdx];
  const slots = [0, 1].map(pi => {
    const img = item.photos[pi];
    return `
      <div class="tl-photo-slot" data-item="${itemIdx}" data-photo="${pi}">
        ${img ? `<img src="${img}" alt="memory photo ${pi + 1}" />` : `
          <div class="tl-photo-placeholder">
            <span>📷</span>
            <span>add photo</span>
          </div>`}
        ${img ? `<button class="tl-photo-remove" data-item="${itemIdx}" data-photo="${pi}" title="remove">✕</button>` : ""}
      </div>`;
  }).join("");

  return `<div class="tl-photos">${slots}</div>`;
}

function toggleTimeline() {
  tlEditing = !tlEditing;
  document.getElementById("tl-edit-btn").textContent  = tlEditing ? "cancel" : "edit timeline";
  document.getElementById("add-mem-btn").style.display = tlEditing ? "flex"  : "none";
  document.getElementById("tl-save-row").style.display = tlEditing ? "flex"  : "none";
  renderTimeline();
}

function saveTimeline() {
  // collect latest values from DOM inputs
  document.querySelectorAll("[data-field][data-idx]").forEach(el => {
    const idx   = +el.dataset.idx;
    const field = el.dataset.field;
    items[idx][field] = el.value;
  });
  tlEditing = false;
  document.getElementById("tl-edit-btn").textContent  = "edit timeline";
  document.getElementById("add-mem-btn").style.display = "none";
  document.getElementById("tl-save-row").style.display = "none";
  renderTimeline();
}

function addItem() {
  items.push({ date: "new date", title: "new memory", desc: "describe this moment...", emoji: "💗", photos: [null, null] });
  renderTimeline();
}

function deleteItem(i) {
  items.splice(i, 1);
  renderTimeline();
}

function initTimeline() {
  document.getElementById("tl-edit-btn").addEventListener("click", toggleTimeline);
  document.getElementById("add-mem-btn").addEventListener("click", addItem);
  document.getElementById("tl-save-btn").addEventListener("click", saveTimeline);
}

/* ── Love Note ────────────────────────────────────────────────────── */

function renderNote() {
  document.getElementById("note-body").textContent = note;
  document.getElementById("note-area").value       = note;
}


/* ── Boot ─────────────────────────────────────────────────────────── */

(function init() {
  loadState();
  renderCountdown();
  setInterval(renderCountdown, 1000);
  renderGallery();
  initGallery();
  renderTimeline();
  initTimeline();
  renderNote();
  initNote();
})();
