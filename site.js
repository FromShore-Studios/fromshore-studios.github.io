/* ==== HIER ANPASSEN ==== */
const EPIC_URL = "";   // Link zur Epic-Store-Seite; leer = "Coming soon"
const EMAIL = "support@fromshorestudios.com";
/* ======================= */
const $ = (q, r = document) => [...r.querySelectorAll(q)];
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Sprache */
function setLang(l) {
  document.documentElement.lang = l;
  $("[data-en]").forEach(e => e.textContent = e.dataset[l]);
  $("[data-alt-en]").forEach(e => e.alt = e.getAttribute("data-alt-" + l));
  $("[data-aria-en]").forEach(e => e.setAttribute("aria-label", e.getAttribute("data-aria-" + l)));
  $("[data-setlang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.setlang === l));
}
let lang = navigator.language?.startsWith("de") ? "de" : "en";
try { lang = localStorage.getItem("lang") || lang; } catch (e) {}
$("[data-setlang]").forEach(b => b.onclick = () => {
  setLang(b.dataset.setlang);
  try { localStorage.setItem("lang", b.dataset.setlang); } catch (e) {}
});
setLang(lang);

$("[data-epic]").forEach(a => {
  if (!EPIC_URL) return;
  a.href = EPIC_URL; a.classList.add("live");
  a.innerHTML = '<span data-l="en">Get it on the Epic Games Store</span><span data-l="de">Zum Epic Games Store</span>';
});
$("[data-mail]").forEach(a => { a.href = "mailto:" + EMAIL; a.textContent = EMAIL; });

/* Augen folgen dem Mauszeiger */
$(".eye").forEach(c => {
  const R = 14, n = 30; c.width = c.height = n;
  const g = c.getContext("2d");
  function draw(dx, dy) {
    g.clearRect(0, 0, n, n);
    const px = n / 2 + dx * R * .32, py = n / 2 + dy * R * .26;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const X = x + .5, Y = y + .5;
      if (((X - n / 2) / R) ** 2 + ((Y - n / 2) / (R * .86)) ** 2 > 1) continue;
      if (((X - px) / (R * .2)) ** 2 + ((Y - py) / (R * .62)) ** 2 <= 1) { g.fillStyle = "#0a080c"; g.fillRect(x, y, 1, 1); }
    }
    g.fillStyle = "#fffff0"; g.fillRect(Math.round(px - R * .4), Math.round(py - R * .45), 2, 2);
  }
  draw(0, -.3);
  addEventListener("pointermove", e => {
    const b = c.getBoundingClientRect(), vx = e.clientX - b.x - b.width / 2, vy = e.clientY - b.y - b.height / 2;
    const k = Math.max(Math.hypot(vx, vy), b.width * .5); draw(vx / k, vy / k);
  }, { passive: true });
});

/* Sprites */
const imgs = {};
for (const k in (window.CAT || {})) { imgs[k] = new Image(); imgs[k].src = "img/cat_" + k + ".png"; }
function frameAt(k, t) {
  const d = CAT[k].durations, total = d.reduce((a, b) => a + b); t = Math.max(0, t) % total;
  let i = 0; while (t >= d[i]) t -= d[i++]; return i;
}
function paint(c, k, t, flip) {
  const s = CAT[k], g = c.getContext("2d");
  if (c.width !== s.w || c.height !== s.h) { c.width = s.w; c.height = s.h; }
  g.clearRect(0, 0, s.w, s.h); g.save();
  if (flip) { g.translate(s.w, 0); g.scale(-1, 1); }
  if (imgs[k].complete) g.drawImage(imgs[k], frameAt(k, t) * s.w, 0, s.w, s.h, 0, 0, s.w, s.h);
  g.restore();
}

/* Tuerchen: 6 Vorschauen, der Rest bleibt verschlossen */
const cal = document.getElementById("cal"), shows = [];
if (cal) {
  const order = [7, 18, 2, 23, 11, 5, 14, 1, 20, 9, 16, 22, 3, 12, 24, 6, 19, 10, 21, 8, 15, 4, 13, 17];
  const peek = { 1: "idle_breathe", 4: "groom_paw", 6: "walk", 9: "curl_sleep", 13: "groom_face", 17: "run" };
  for (const n of order) {
    const b = document.createElement("button");
    b.className = "door"; b.type = "button"; b.setAttribute("aria-label", "" + n);
    b.innerHTML = `${peek[n] ? "<canvas></canvas>" : ""}<span class="leaf">${n}</span>`;
    if (peek[n]) {
      b.classList.add("peek");
      const c = b.firstChild; c.style.width = CAT[peek[n]].w / 44 * 100 + "%";
      shows.push([c, peek[n]]);
      b.onclick = () => b.classList.toggle("open");
      if (n === 6) b.classList.add("open");
    } else b.onclick = () => { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); };
    cal.append(b);
  }
}

/* Katze auf der Leiste */
const pet = document.getElementById("pet"), Z = 3;
let x = 40, dir = 1, mode = "walk", until = 0, start = 0, last = 0;
function pick(t, m) {
  mode = m || ["walk", "walk", "idle_breathe", "groom_paw", "curl_sleep"][Math.random() * 5 | 0];
  if (mode === "walk" && Math.random() < .4) dir = -dir;
  start = t; until = t + (mode === "run" ? 2200 : 5000 + Math.random() * 4000);
}
function tick(t) {
  if (t - last > 33) {
    const dt = Math.min(t - last, 100); last = t;
    if (pet) {
      if (t > until) pick(t, until ? null : "walk");
      const v = mode === "walk" ? 22 : mode === "run" ? 72 : 0, max = innerWidth - CAT[mode].w * Z;
      x += dir * v * Z * dt / 1000;
      if (x < 0) { x = 0; dir = 1; }
      if (x > max) { x = Math.max(0, max); dir = -1; }
      paint(pet, mode, t - start, dir < 0);
      pet.style.width = CAT[mode].w * Z + "px";
      pet.parentNode.style.transform = `translateX(${Math.round(x / Z) * Z}px)`;
    }
    shows.forEach(([c, k]) => paint(c, k, t));
  }
  requestAnimationFrame(tick);
}
if (window.CAT) {
  if (calm) {
    addEventListener("load", () => {
      if (pet) { paint(pet, "idle_breathe", 0); pet.style.width = CAT.idle_breathe.w * Z + "px"; }
      shows.forEach(([c, k]) => paint(c, k, 0));
    });
  } else {
    requestAnimationFrame(tick);
    if (pet) pet.parentNode.onclick = () => pick(performance.now(), "run");
  }
}

/* Kontaktformular: baut eine E-Mail fuer das Mailprogramm, sendet selbst nichts */
const form = document.getElementById("contact");
if (form) {
  const val = id => document.getElementById(id).value.trim();
  const tr = (en, de) => document.documentElement.lang === "de" ? de : en;
  const topics = { bug: ["Bug report", "Fehlermeldung"], question: ["Question", "Frage"], press: ["Press", "Presse"], other: ["Message", "Nachricht"] };
  const build = () => {
    const subject = "A Cat for Christmas Eve: " + tr(...topics[val("c-topic")]);
    const body = val("c-msg") + (val("c-win") ? "\n\nWindows: " + val("c-win") : "");
    return { subject, body };
  };
  const say = t => document.getElementById("c-state").textContent = t;
  form.onsubmit = e => {
    e.preventDefault();
    const m = build();
    if (!m.body.trim() || !val("c-msg")) return say(tr("Please write a message first.", "Schreib bitte erst eine Nachricht."));
    const url = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body.replace(/\n/g, "\r\n"));
    form.dataset.url = url;
    location.href = url;
    say(tr("If no email app opens, copy the message and send it to ", "Falls sich kein E-Mail-Programm öffnet: Nachricht kopieren und senden an ") + EMAIL);
  };
  document.getElementById("c-copy").onclick = async () => {
    const m = build();
    if (!val("c-msg")) return say(tr("Please write a message first.", "Schreib bitte erst eine Nachricht."));
    try {
      await navigator.clipboard.writeText(EMAIL + "\n" + m.subject + "\n\n" + m.body);
      say(tr("Copied. Send it to ", "Kopiert. Sende es an ") + EMAIL);
    } catch (err) { say(tr("Copying is blocked. Please write to ", "Kopieren ist blockiert. Schreib bitte an ") + EMAIL); }
  };
}
