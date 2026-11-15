// Background music
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
bgMusic.volume = 0.5;
function syncMusicBtn() {
  const off = bgMusic.muted || bgMusic.paused;
  musicBtn.classList.toggle('muted', off);
  musicBtn.setAttribute('aria-label', off ? 'Unmute music' : 'Mute music');
}
musicBtn.onclick = () => {
  if (bgMusic.paused) { bgMusic.muted = false; bgMusic.play().catch(() => {}); }
  else bgMusic.muted = !bgMusic.muted;
  syncMusicBtn();
};
bgMusic.addEventListener('play', syncMusicBtn);
bgMusic.addEventListener('pause', syncMusicBtn);

// Intro envelope
document.body.classList.add('locked');
document.getElementById('openBtn').onclick = () => {
  document.getElementById('intro').classList.add('hide');
  document.body.classList.remove('locked');
  document.body.classList.add('opened');
  bgMusic.play().catch(() => {});
};

// Falling gold petals in hero
const petals = document.getElementById('petals');
for (let i = 0; i < 22; i++) {
  const p = document.createElement('span');
  p.className = 'petal';
  const size = 6 + Math.random() * 10;
  p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;--dx:${(Math.random() - .5) * 200}px;animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 15}s;opacity:${.4 + Math.random() * .5}`;
  petals.appendChild(p);
}

// Nav on scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('show', scrollY > 200));

// Countdown — Sunday 29 Nov 2026, approx. after Maghrib (~6:00 PM IST)
const target = new Date('2026-11-29T18:00:00+05:30').getTime();
const pad = n => String(n).padStart(2, '0');
function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5); diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  [['d', d], ['h', h], ['m', m], ['s', s]].forEach(([id, v]) => document.getElementById(id).textContent = pad(v));
}
tick(); setInterval(tick, 1000);

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// RSVP
document.getElementById('rsvpForm').onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById('rName').value.trim();
  const att = document.querySelector('input[name=att]:checked').value;
  const count = document.getElementById('rCount').value;
  const list = JSON.parse(localStorage.getItem('rsvps') || '[]');
  list.push({ name, att, count, at: Date.now() });
  localStorage.setItem('rsvps', JSON.stringify(list));
  document.getElementById('rsvpMsg').textContent = att === 'yes'
    ? `Shukran, ${name}! We look forward to welcoming you (${count}).`
    : `Shukran, ${name}. You will be missed — please keep the couple in your duas.`;
  e.target.reset();
};

// Wishes
const wishList = document.getElementById('wishList');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderWishes() {
  const wishes = JSON.parse(localStorage.getItem('wishes') || '[]');
  wishList.innerHTML = wishes.slice().reverse().map(w => `<div class="wish"><strong class="script">${esc(w.name)}</strong><p>${esc(w.msg)}</p></div>`).join('');
}
document.getElementById('wishForm').onsubmit = e => {
  e.preventDefault();
  const wishes = JSON.parse(localStorage.getItem('wishes') || '[]');
  wishes.push({ name: document.getElementById('wName').value.trim(), msg: document.getElementById('wMsg').value.trim() });
  localStorage.setItem('wishes', JSON.stringify(wishes));
  e.target.reset(); renderWishes();
};
renderWishes();

// Add to calendar (.ics)
document.getElementById('calBtn').onclick = e => {
  e.preventDefault();
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    'DTSTART:20261129T123000Z', 'DTEND:20261129T163000Z',
    'SUMMARY:Husain & Batool — Daris ane Khushi nu Jaman',
    'LOCATION:Mawaid, Amjhera', 'DESCRIPTION:After Maghrib. Ezzi wala family.',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'husain-batool-wedding.ics'; a.click();
};
