/* transitions.js — cấu hình ánh sáng theo từng slide, vẽ bóng người/khán giả bằng SVG,
   tách chữ theo ký tự, nạp ảnh tùy chọn. */

/* ---- Màu ánh sáng: từ lạnh → ấm ---- */
const COLD = [138, 160, 189], WARM = [217, 185, 120];
function lightColor(w) {
  const m = (a, b) => Math.round(a + (b - a) * w);
  return `rgb(${m(COLD[0], WARM[0])}, ${m(COLD[1], WARM[1])}, ${m(COLD[2], WARM[2])})`;
}

/* ---- Ánh sáng từng slide (chỉ số 0 = slide 1) ----
   x: vị trí tâm cột sáng (px trên sân khấu 1920), w: bề rộng đáy, o: độ sáng,
   po: vũng sáng dưới sàn, warm: 0 lạnh → 1 ấm, dust: độ dày bụi,
   steps: ánh sáng đổi theo từng lần bấm tiếp, seq: chuỗi thay đổi theo thời gian (ms). */
const LIGHTS = [
  /* 1  */ { x: 640, w: 560, o: .95, po: 1, warm: 0, dust: 1, seq: [[2800, { w: 1050, o: 1 }]] },
  /* 2  */ { x: 1250, w: 1200, o: .55, po: 0, warm: .08, dust: .8 },
  /* 3  */ { x: 1440, w: 1000, o: .55, po: 0, warm: .12, dust: .6 },
  /* 4  */ { x: 960, w: 1100, o: .28, po: 0, warm: .1, dust: .8 },
  /* 5  */ { x: 380, w: 600, o: .6, po: 0, warm: .15, dust: .8, steps: { 0: { x: 380 }, 1: { x: 960 }, 2: { x: 1540 } } },
  /* 6  */ { x: 960, w: 1500, o: .3, po: 1, warm: .15, dust: 1 },
  /* 7  */ { x: 960, w: 420, o: .5, po: 0, warm: .25, dust: .6 },
  /* 8  */ { x: 520, w: 900, o: .6, po: 0, warm: .35, dust: .8, steps: { 0: { x: 520 }, 1: { x: 1440, warm: .3 }, 2: { x: 960, w: 1800, warm: .6 } } },
  /* 9  */ { x: 300, w: 600, o: .55, po: 0, warm: .2, dust: .8, steps: { 0: { x: 300 }, 1: { x: 700, warm: .25 }, 2: { x: 1100, warm: .3 }, 3: { x: 1560, w: 900, o: .95, warm: .95 } } },
  /* 10 */ { x: 1500, w: 760, o: .5, po: 0, warm: .8, dust: 1 },
  /* 11 */ { x: 960, w: 1000, o: .65, po: 0, warm: .5, dust: .3 },
  /* 12 */ { x: 400, w: 800, o: .5, po: 0, warm: .6, dust: .8, steps: { 0: { x: 400 }, 1: { x: 1020, w: 700 }, 2: { x: 1560, w: 700 }, 3: { x: 1020, w: 700 }, 4: { x: 1560, w: 700, warm: .85 } } },
  /* 13 */ { x: 640, w: 1350, o: .95, po: 1, warm: .9, dust: 1 },
  /* 14 */ { x: 960, w: 1500, o: .8, po: 0, warm: 1, dust: .9 }
];

/* ---- Số lần bấm tiếp ngoài data-step / data-lit ---- */
const EXTRA_STEPS = { 3: 2 };  // slide 4: hai lần bấm để camera đi sang cảnh 2, 3

/* ---- Việc làm riêng khi vào / rời slide ---- */
const HOOKS = {
  12: {  // slide 13: nhân vật ngẩng đầu và bước về phía ánh sáng
    enter(el) {
      const p = el.querySelector('.person');
      p.classList.add('bowed');
      el._t = [
        setTimeout(() => p.classList.remove('bowed'), 1600),
        setTimeout(() => el.classList.add('walk'), 2200)
      ];
    },
    leave(el) { (el._t || []).forEach(clearTimeout); el.classList.remove('walk'); }
  }
};

/* ---- Bóng người (SVG) ---- */
const PERSON_SVG = `<svg viewBox="0 0 200 540" aria-hidden="true">
  <g class="torso">
    <path class="neck" d="M89 96 h22 v36 h-22 z"/>
    <path class="body" d="M52 152 C52 126 76 114 100 114 C124 114 148 126 148 152 L152 300 L138 304 L136 528 L106 528 L100 336 L94 528 L64 528 L62 304 L48 300 Z"/>
    <path class="arm armL" d="M50 150 C34 205 32 262 38 318 L54 320 C52 264 58 205 68 162 Z"/>
    <path class="arm armR" d="M150 150 C166 205 168 262 162 318 L146 320 C148 264 142 205 132 162 Z"/>
  </g>
  <g class="head">
        <ellipse class="headc" cx="100" cy="62" rx="27" ry="33"/>
  </g>
</svg>`;

/* ---- Khán giả: hàng đầu người ngồi, một bàn tay giơ nửa chừng ---- */
function seatedFigure(x, y, s, dim, extra) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${dim}">
    ${extra || ''}
    <path class="audience-head" d="M-110 300 C-110 130 -60 66 0 66 C60 66 110 130 110 300 Z"/>
    <circle class="audience-head" cx="0" cy="0" r="46"/>
  </g>`;
}
function buildAudience(svg) {
  const xs = [180, 500, 820, 1140, 1460, 1780];
  let out = '';
  [260, 660, 1000, 1330, 1620].forEach((x) => { out += seatedFigure(x, 130, .78, .55); });  // hàng sau
  xs.forEach((x, i) => {
    if (i === 4) {
      const hand = `<g class="hand"><line x1="55" y1="112" x2="96" y2="-60" stroke="#07080a" stroke-width="30" stroke-linecap="round"/><circle cx="98" cy="-72" r="21" fill="#07080a"/></g>`;
      out += seatedFigure(x, 215, 1, 1, hand);
    } else {
      out += seatedFigure(x, 215, 1, 1);
    }
  });
  svg.innerHTML = out;
}
function buildAudienceSmall(svg) {
  let out = '';
  [{ x: 175, y: 330, s: .52, d: .55 }, { x: 345, y: 330, s: .52, d: .55 }].forEach((p) => { out += seatedFigure(p.x, p.y, p.s, p.d); });
  [{ x: 100, y: 420, r: 0 }, { x: 260, y: 420, r: 14 }, { x: 420, y: 420, r: 0 }].forEach((p) => {
    out += `<g transform="translate(${p.x} ${p.y}) scale(.72) rotate(${p.r})"><path class="audience-head" d="M-110 300 C-110 130 -60 66 0 66 C60 66 110 130 110 300 Z"/><circle class="audience-head" r="46"/></g>`;
  });
  svg.innerHTML = out;
}

/* ---- Khởi tạo thành phần động ---- */
function initDecor() {
  document.querySelectorAll('[data-person]').forEach((el) => { el.innerHTML = PERSON_SVG; });
  document.querySelectorAll('[data-gen="audience"]').forEach(buildAudience);
  document.querySelectorAll('[data-gen="audience-small"]').forEach(buildAudienceSmall);

  // Tách chữ theo ký tự (giữ nguyên dấu tiếng Việt: dùng chuẩn NFC)
  document.querySelectorAll('.split').forEach((el) => {
    const text = el.textContent.normalize('NFC');
    const base = parseFloat(el.dataset.d || '0');
    el.setAttribute('aria-label', text);
    el.innerHTML = Array.from(text).map((c, i) =>
      `<span class="ch${c === '?' ? ' qm' : ''}" style="--i:${i};--d:${base}s" aria-hidden="true">${c}</span>`).join('');
  });

  // Ảnh tùy chọn: có file trong assets/images thì dùng, không thì bỏ qua (không lỗi)
  document.querySelectorAll('.photo[data-img]').forEach((ph) => {
    const img = new Image();
    img.onload = () => {
      ph.style.backgroundImage = `url("${ph.dataset.img}")`;
      ph.classList.add('has');
      const slide = ph.closest('.slide');
      slide.classList.add('photo-on');
      const cr = slide.querySelector('.credit');
      if (cr && ph.dataset.credit) { cr.textContent = ph.dataset.credit; cr.classList.add('has'); }
    };
    img.src = ph.dataset.img;
  });
}
