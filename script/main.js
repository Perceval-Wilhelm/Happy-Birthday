// The card is one GSAP timeline that pauses at the cake until the candles are blown out.
gsap.registerPlugin(SplitText);

const $ = (selector) => document.querySelector(selector);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const m = reduce ? 0 : 1; // scales every movement, so reduced motion keeps only the fades
const grow = (scale) => (reduce ? 1 : scale);
const PALETTE = ['#ff8fb1', '#ffd36e', '#b79bff', '#7fd8c8', '#ffb38a', '#fff6ec'];

const song = $('.song');
const sound = $('.sound');
const cake = $('.cake');
const name = $('#name').textContent.trim();
document.querySelectorAll('.js-name').forEach((el) => (el.textContent = name));
$('.date').textContent = '♡ ' + new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });


// ---------- Sky: twinkling stars and the odd shooting star ----------
const sky = $('#sky');
const ctx = sky.getContext('2d');
let W, H, stars;
let shot = null;
let nextShot = 4;

function resizeSky() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    sky.width = W * dpr;
    sky.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((W * H) / 4500) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + .2,
        alpha: Math.random() * .7 + .2,
        speed: Math.random() * 1.5 + .4,
        phase: Math.random() * 7,
    }));
    if (reduce) drawSky(0);
}

function drawSky(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (const s of stars) {
        ctx.globalAlpha = s.alpha * (.65 + .35 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
    if (!reduce && !shot && t > nextShot) shot = { t, x: W * (.45 + Math.random() * .55), y: H * Math.random() * .35 };
    if (shot) {
        const p = Math.min((t - shot.t) / .9, 1);
        const x = shot.x - p * W * .5;
        const y = shot.y + p * W * .22;
        const tail = ctx.createLinearGradient(x, y, x + 120, y - 53);
        tail.addColorStop(0, '#fff');
        tail.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.globalAlpha = Math.sin(p * Math.PI);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 120, y - 53);
        ctx.stroke();
        if (p === 1) {
            shot = null;
            nextShot = t + 5 + Math.random() * 9;
        }
    }
    ctx.globalAlpha = 1;
}

addEventListener('resize', resizeSky);
resizeSky();
if (!reduce) gsap.ticker.add(drawSky);


// ---------- Balloons: CSS sways them, GSAP floats them up ----------
const BALLOON_COLORS = [['#ff8fb1', '#d64f7e'], ['#ffd36e', '#d9952b'], ['#b79bff', '#7756d1'], ['#7fd8c8', '#38998a'], ['#ffb38a', '#d96c3f']];
const balloons = reduce ? [] : Array.from({ length: innerWidth < 600 ? 12 : 20 }, (_, i) => {
    const [c, d] = BALLOON_COLORS[i % BALLOON_COLORS.length];
    const el = document.createElement('div');
    el.className = 'balloon';
    el.innerHTML = '<div class="b"></div>';
    el.style.cssText = `left:${gsap.utils.random(-4, 92)}%;--size:${gsap.utils.random(48, 90)}px;--c:${c};--d:${d};--sway:${gsap.utils.random(2.2, 3.8)}s`;
    $('.balloons').append(el);
    return el;
});

// Not part of the timeline, so the balloons keep floating while it waits at the cake
const releaseBalloons = () => balloons.forEach((b) => gsap.fromTo(b, { y: 0 }, {
    y: -(innerHeight + 320),
    duration: gsap.utils.random(6, 9.5),
    delay: gsap.utils.random(0, 2.5),
    ease: 'none',
    overwrite: true,
}));


// ---------- Confetti moments (decoration: the story still plays if its CDN fails) ----------
const pop = (options) => window.confetti?.({ colors: PALETTE, disableForReducedMotion: true, ...options });
const heart = window.confetti?.shapeFromText({ text: '💗', scalar: 2 });

const centerOf = (el, fy = .5) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * fy) / innerHeight };
};
const celebrate = () => pop({ particleCount: 160, spread: 110, startVelocity: 48, scalar: 1.1, shapes: ['star', 'circle', 'square'], origin: centerOf(cake, .2) });
const cannons = () => {
    pop({ particleCount: 2, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: .9 } });
    pop({ particleCount: 2, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: .9 } });
};
const firework = () => pop({
    particleCount: 70, spread: 360, startVelocity: 24, gravity: .6, decay: .93, ticks: 120, scalar: .9, shapes: ['star', 'circle'],
    origin: { x: gsap.utils.random(.15, .85), y: gsap.utils.random(.12, .4) },
});
const hearts = (origin = { x: Math.random(), y: -.05 }, count = 1) => heart && pop({
    particleCount: count, shapes: [heart], scalar: 2, flat: true, spread: 90, gravity: .35, ticks: 500,
    startVelocity: count > 1 ? 22 : 0, drift: gsap.utils.random(-.5, .5), origin,
});

addEventListener('pointerdown', (e) => pop({
    particleCount: 12, spread: 360, startVelocity: 12, gravity: .5, decay: .9, ticks: 60, scalar: .6, shapes: ['star'],
    origin: { x: e.clientX / innerWidth, y: e.clientY / innerHeight },
}));


// ---------- Text helpers ----------
const words = (target, className) => {
    const list = SplitText.create(target, { type: 'words', ignore: '.scribble' }).words;
    if (className) list.forEach((w) => w.classList.add(className));
    return list;
};

const tl = gsap.timeline({ paused: true, defaults: { duration: .9, ease: 'power3.out' } });
const HIDDEN = { autoAlpha: 0, y: 28 * m, rotationX: -55 * m, transformPerspective: 500, filter: `blur(${8 * m}px)` };
const SHOWN = { autoAlpha: 1, y: 0, rotationX: 0, filter: 'blur(0px)' };

const show = (target, at) => tl.set(target, { autoAlpha: 1 }, at);
const reveal = (target, at, stagger = .07) => tl.fromTo(words(target), HIDDEN, { ...SHOWN, stagger }, at);
const leave = (target, at) => tl.fromTo(target, { y: 0, filter: 'blur(0px)' }, {
    autoAlpha: 0, y: -26 * m, filter: `blur(${8 * m}px)`, duration: .7, ease: 'power2.in', immediateRender: false,
}, at);
const write = (target, at, duration = 1.1) => {
    const list = words(target, 'ink');
    tl.fromTo(list, { '--p': '0%' }, { '--p': '130%', duration, ease: 'power1.inOut', stagger: duration * .7 }, at);
    return list;
};
const line = (target, hold) => {
    show(target);
    reveal(target);
    leave(target, `+=${hold}`);
};


// ---------- The story ----------
// 1 · Hi + name
show('.hi');
tl.from('.hi-word', { autoAlpha: 0, y: 18 * m, duration: .8 });
write('#name', '-=.3');
reveal('#greetingText', '-=.2', .05);
leave('.hi', '+=2.8');

// 2 · It's your birthday!! :D
show('.bday');
tl.from(SplitText.create('.bday p', { type: 'words,chars' }).chars, {
    autoAlpha: 0, y: 60 * m, scale: grow(.3), rotation: () => gsap.utils.random(-35, 35) * m,
    duration: .7, ease: 'back.out(2.2)', stagger: .03,
});
tl.to('.grin', { rotation: 90, duration: .5, ease: 'back.out(3)' }, '+=.3');
leave('.bday', '+=1.8');

// 3 · The message that almost got sent
const draft = $('.hbd-chatbox');
const letters = Array.from(draft.textContent.trim().replace(/\s+/g, ' '));
const typed = { n: 0 };
const renderDraft = () => (draft.textContent = letters.slice(0, Math.round(typed.n)).join(''));
renderDraft();
show('.chat');
tl.from('.phone', { autoAlpha: 0, y: 70 * m, scale: grow(.92), duration: 1, ease: 'back.out(1.4)' });
tl.to(typed, { n: letters.length, duration: letters.length * .04, ease: 'none', onUpdate: renderDraft }, '+=.3');
tl.to('.send', { backgroundColor: '#f6c56f', color: '#3a2410', scale: 1.15, duration: .35, ease: 'back.out(3)' }, '+=.3');
tl.to(typed, { n: 0, duration: 1.4, ease: 'power2.in', onUpdate: renderDraft }, '+=1.4');
tl.to('.send', { backgroundColor: 'rgba(255, 255, 255, .1)', color: '#fff6ec', scale: 1, duration: .3 }, '<');
tl.to('.chat', { autoAlpha: 0, y: 30 * m, scale: grow(.94), duration: .7, ease: 'power2.in' }, '+=.5');

// 4 · Second thoughts
line('.idea-1', 2.2);
line('.idea-2', 1.8);
show('.idea-3');
reveal('.idea-3');
$('.mark').append($('.scribble')); // SplitText tucks it into the last word; the underline belongs to the whole mark
tl.to('.scribble path', { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, '-=.2');
leave('.idea-3', '+=2.2');
line('.idea-4', 1.1);
show('.idea-5');
tl.fromTo(words('.idea-5'), { ...HIDDEN, y: 50 * m, rotationX: -80 * m }, { ...SHOWN, duration: 1.1, stagger: .09 });
tl.to('.smile', { rotation: 90, duration: .6, ease: 'back.out(3)' }, '+=.6');
leave('.idea-5', '+=1.8');

// 5 · S O
show('.so');
tl.fromTo('.so span', { autoAlpha: 0, scale: grow(3), rotation: 18 * m }, { autoAlpha: 1, scale: 1, rotation: 0, duration: .8, ease: 'expo.out', stagger: .22 });
tl.to('.so span', { color: 'rgba(246, 197, 111, 1)', duration: .5, stagger: .12 }, '-=.2');
tl.to('.so span', { autoAlpha: 0, scale: grow(3.2), rotation: -18 * m, duration: .8, ease: 'expo.in', stagger: .14 }, '+=1');

// 6 · Make a wish: the timeline waits here until the candles are blown out
tl.call(releaseBalloons, null, '-=.4');
show('.cake-scene', '<');
tl.from('.cake', { autoAlpha: 0, y: 140 * m, scale: grow(.8), duration: 1.1, ease: 'back.out(1.5)' }, '<');
reveal('.prompt', '-=.4', .05);
tl.addPause('+=.2', waitForBlow);

// 7 · Candles out, party on
tl.to('.prompt', { autoAlpha: 0, duration: .4, ease: 'power1.out' });
tl.to('.flame-wrap', { autoAlpha: 0, scaleX: .3, scaleY: 0, transformOrigin: '50% 100%', duration: .35, ease: 'power2.in', stagger: .12 }, '<');
tl.to('.halo', { autoAlpha: 0, duration: .8 }, '<');
tl.fromTo('.smoke', { autoAlpha: .8, y: 0 }, { autoAlpha: 0, y: -28 * m, duration: 1.8, ease: 'power1.out', stagger: .12, immediateRender: false }, '<.25');
tl.addLabel('party', '<.4');
tl.call(celebrate, null, 'party');
tl.to({}, { duration: 2.8, onUpdate: cannons }, 'party');
tl.call(releaseBalloons, null, 'party+=.3');
tl.to('.cake-scene', { autoAlpha: 0, y: 90 * m, duration: .8, ease: 'power2.in' }, 'party+=1.4');

// 8 · The wish
show('.wish', 'party+=2');
tl.fromTo('.polaroid', { autoAlpha: 0, y: -80 * m, rotation: -3 - 16 * m, scale: grow(1.25) }, { autoAlpha: 1, y: 0, rotation: -3, scale: 1, duration: 1.2, ease: 'back.out(1.3)' }, 'party+=2');
// the photo develops like an instant print
tl.fromTo('.photo', { filter: 'brightness(2.6) saturate(0) blur(8px)' }, { filter: 'brightness(1) saturate(1) blur(0px)', duration: 3, ease: 'power2.out' }, '<.3');
tl.from('.tape', { autoAlpha: 0, scale: grow(1.8), duration: .5, ease: 'back.out(2.5)' }, '<.5');
tl.from('.hat', { autoAlpha: 0, y: -260 * m, rotation: -60 * m, duration: 1.1, ease: 'bounce.out' }, '<.2');
tl.from('.date', { autoAlpha: 0, duration: .8 }, '<.5');
const hbd = write('.wish-hbd', '<.1', 1.2);
reveal('#wishText', '-=.4', .05);
tl.to(hbd, { y: -10 * m, duration: .4, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: .18 }, '+=.3');
for (let i = 0; i < 6; i++) tl.call(firework, null, `party+=${2.8 + i * 1.2}`);

// 9 · The end
tl.addLabel('end', '+=3');
tl.to('.wish', { autoAlpha: 0, y: -40 * m, scale: grow(.94), duration: 1, ease: 'power2.inOut' }, 'end');
show('.end', 'end+=.6');
reveal('.end-msg', 'end+=.6', .06);
tl.from('#replay', { autoAlpha: 0, y: 24 * m, duration: .7, ease: 'back.out(2)' }, '+=.5');
tl.from('.last-smile', { autoAlpha: 0, scale: grow(0), duration: .5, ease: 'back.out(3)' }, '+=.2');
tl.to('.last-smile', { rotation: 90, duration: .6, ease: 'back.out(2.5)' }, '+=.7');
tl.to({}, { duration: 6, onUpdate: () => Math.random() < .1 && hearts() }, 'end+=1');


// ---------- Opening the gift (also the tap that unlocks audio) ----------
let started = false;
const keepAwake = () => navigator.wakeLock?.request('screen').catch(() => {});
const setMuted = (muted) => {
    song.muted = muted;
    sound.setAttribute('aria-pressed', String(!muted));
};

$('.gift').addEventListener('click', (e) => {
    started = true;
    e.currentTarget.disabled = true;
    e.currentTarget.classList.add('is-open');
    song.volume = 0;
    song.play().then(() => setMuted(false), () => setMuted(true));
    gsap.to(song, { volume: 1, duration: 3 });
    keepAwake();
    gsap.timeline({ onComplete: () => tl.play() })
        .to('.lid', { y: -90 * m, x: 18 * m, rotation: 30 * m, autoAlpha: 0, transformOrigin: '50% 100%', duration: .8, ease: 'power2.out' })
        .fromTo('.gift-glow', { opacity: 0, scale: .4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.4, duration: .6 }, '<')
        .call(() => pop({ particleCount: 90, spread: 80, startVelocity: 38, shapes: ['star', 'circle'], origin: centerOf($('.gift-box'), .45) }), null, '<.1')
        .fromTo('.gate', { filter: 'blur(0px)' }, { autoAlpha: 0, scale: grow(1.15), filter: `blur(${10 * m}px)`, duration: 1, ease: 'power2.in' }, '+=.5')
        .to(sound, { autoAlpha: 1, duration: .6 }, '-=.3');
}, { once: true });

sound.addEventListener('click', () => (song.paused ? song.play().then(() => setMuted(false), () => {}) : setMuted(!song.muted)));

// Pause the music with the tab, and keep the screen awake while the card plays
document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) return song.pause();
    song.play().catch(() => {});
    keepAwake();
});


// ---------- Blowing out the candles ----------
let autoBlow;

function waitForBlow() {
    cake.classList.add('is-waiting');
    cake.focus({ preventScroll: true });
    autoBlow = gsap.delayedCall(20, blow); // nobody stays stuck if the hint is missed
}

function blow() {
    if (!cake.classList.contains('is-waiting')) return;
    cake.classList.remove('is-waiting');
    autoBlow.kill();
    tl.play();
}

cake.addEventListener('click', blow);

$('#replay').addEventListener('click', () => {
    window.confetti?.reset();
    tl.restart();
});

$('.last-smile').addEventListener('click', (e) => hearts(centerOf(e.currentTarget), 12));
