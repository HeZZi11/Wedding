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

// Personalized Guest Invitation (?to=Name or ?name=Name)
const urlParams = new URLSearchParams(window.location.search);
const guestParam = (urlParams.get('to') || urlParams.get('name') || urlParams.get('guest') || '').trim();

if (guestParam) {
  // 1. Show on Front Intro Envelope
  const guestWrap = document.getElementById('guestWrap');
  const guestName = document.getElementById('guestName');
  const defaultEyebrow = document.getElementById('defaultEyebrow');
  if (guestWrap && guestName) {
    guestName.textContent = guestParam;
    guestWrap.style.display = 'block';
    if (defaultEyebrow) defaultEyebrow.style.display = 'none';
  }

  // 2. Pre-fill RSVP Name Field
  const rName = document.getElementById('rName');
  if (rName) {
    rName.value = guestParam;
  }

  // 3. Pre-fill Wishes Name Field
  const wName = document.getElementById('wName');
  if (wName) {
    wName.value = guestParam;
  }
}

// Falling gold petals in hero
const petals = document.getElementById('petals');
for (let i = 0; i < 22; i++) {
  const p = document.createElement('span');
  p.className = 'petal';
  const size = 6 + Math.random() * 10;
  p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;--dx:${(Math.random() - .5) * 200}px;animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 15}s;opacity:${.4 + Math.random() * .5}`;
  petals.appendChild(p);
}

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

// Google Sheet Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzJQpJGWtEBZDxDBVJsNhcs8CPI5a7QG6zvKZzwCFvAfGeYi6xhU6Lq4oTV84IaiCbs/exec';

// RSVP (Saved to your Google Sheet)
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSubmit = document.getElementById('rsvpSubmit');
const rsvpMsg = document.getElementById('rsvpMsg');

rsvpForm.onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('rName').value.trim();
  const att = document.querySelector('input[name=att]:checked').value;
  const count = document.getElementById('rCount').value;
  if (!name) return;

  rsvpSubmit.disabled = true;
  rsvpSubmit.textContent = 'Sending...';
  rsvpMsg.textContent = '';

  const attendingStatus = att === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline';
  const guestsNum = att === 'yes' ? count : 0;
  const statusSummary = att === 'yes' ? `Attending (${count} guests)` : 'Regretfully Decline';

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        type: 'rsvp',
        name,
        attending: attendingStatus,
        count: guestsNum,
        msg: statusSummary
      }),
    });

    rsvpMsg.textContent = att === 'yes'
      ? `Shukran, ${name}! We look forward to welcoming you (${count}).`
      : `Shukran, ${name}. You will be missed — please keep the couple in your duas.`;

    rsvpForm.reset();
  } catch (err) {
    rsvpMsg.textContent = `Shukran, ${name}! Your RSVP has been recorded.`;
    rsvpForm.reset();
  } finally {
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = 'Send RSVP';
  }
};

// Wishes (Saved privately to your Google Sheet)
const wishForm = document.getElementById('wishForm');
const wishSubmit = document.getElementById('wishSubmit');
const wishMsg = document.getElementById('wishMsg');

wishForm.onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('wName').value.trim();
  const msg = document.getElementById('wMsg').value.trim();
  if (!name || !msg) return;

  wishSubmit.disabled = true;
  wishSubmit.textContent = 'Sending...';
  wishMsg.textContent = '';

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        type: 'wish',
        name,
        msg
      }),
    });

    wishMsg.textContent = `Shukran, ${name}! Your heartfelt dua has been delivered to the family.`;
    wishForm.reset();
  } catch (err) {
    wishMsg.textContent = `Shukran, ${name}! Your dua has been sent.`;
    wishForm.reset();
  } finally {
    wishSubmit.disabled = false;
    wishSubmit.textContent = 'Send Wishes';
  }
};

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


// ── Hide Netlify free-tier badge (Shadow DOM) ──
(function hideNetlifyBadge() {
  const SELECTORS = [
    '[data-netlify-badge]', '.netlify-badge', '#netlify-badge',
    'netlify-badge', '#nl-badge', '.nl-badge', '[data-nf-variant]'
  ];
  const hide = () => {
    SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.cssText = 'display:none!important;visibility:hidden!important;opacity:0!important';
      });
    });
    // Also nuke the Netlify HUD script element so it never injects
    document.querySelectorAll('script[src*="netlify"][src*="hud"]').forEach(s => s.remove());
  };
  hide();
  const obs = new MutationObserver(hide);
  obs.observe(document.documentElement, { childList: true, subtree: true });
  // Stop observing after 10 seconds (badge appears within first few seconds)
  setTimeout(() => obs.disconnect(), 10000);
})();
