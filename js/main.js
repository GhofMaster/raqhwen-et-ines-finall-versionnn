/* ---------------- opening ---------------- */
const intro = document.getElementById('intro');
const env   = document.getElementById('envelope');

function openInvite(){
  env.classList.add('open');
  startMusic();
  setTimeout(()=>{
    intro.classList.add('hide');
    document.body.classList.remove('locked');
  }, 1500);
  setTimeout(()=>{ intro.style.display='none'; }, 2600);
}

/* ---------------- countdown ---------------- */
const target = new Date('2026-10-26T18:30:00+01:00').getTime();
const pad = n => String(n).padStart(2,'0');
const prevVals = {d:null,h:null,m:null,s:null};
function setUnit(id, val){
  const el = document.getElementById(id);
  if(prevVals[id] !== val){
    el.textContent = val;
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
    prevVals[id] = val;
  }
}
function countdown(){
  let x = target - Date.now(); if(x < 0) x = 0;
  setUnit('d', Math.floor(x/86400000));
  setUnit('h', pad(Math.floor(x%86400000/3600000)));
  setUnit('m', pad(Math.floor(x%3600000/60000)));
  setUnit('s', pad(Math.floor(x%60000/1000)));
}
countdown(); setInterval(countdown, 1000);

/* ---------------- staggered reveal indices ---------------- */
document.querySelectorAll('.event, .row, .unit').forEach((el, i, list)=>{
  const siblings = Array.from(el.parentElement.children);
  el.style.setProperty('--i', siblings.indexOf(el));
});

/* ---------------- share ---------------- */
async function shareInvite(){
  const message =
    'مرحبا بيكم يا أغلى الناس 🤍\n\n' +
    'إن شاء الله راكم فرحانين معانا، وفرحتنا تكمل بوجودكم وحضوركم.\n' +
    'نحبكم برشا، ونتمنى من قلبي تكونوا معانا في نهار فرحتنا، وتشاركونا أجمل لحظات حياتنا.\n' +
    'وجودكم بيناتنا فرحة كبيرة ليا، وإن شاء الله نفرحوا بيكم كيف ما فرحتوني 🤍✨\n\n' +
    'بكل الحب، Ines 💍';
  const data = {title:'Radhwen & Ines', text: message, url: location.href};
  try{
    if(navigator.share){
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(message + '\n' + location.href);
      alert('تم نسخ الدعوة والرابط، يمكنكم لصقها الآن لمشاركتها');
    }
  }catch(e){}
}

/* ---------------- letter overlay ---------------- */
const letterOverlay = document.getElementById('letterOverlay');
let sparklesStarted = false;

function openLetter(){
  letterOverlay.classList.add('open');
  document.body.classList.add('locked');
  if(!sparklesStarted){ sparklesStarted = true; startLetterSparkles(); }
}
function closeLetter(){
  letterOverlay.classList.remove('open');
  document.body.classList.remove('locked');
}

function startLetterSparkles(){
  const c = document.getElementById('letterSparkles');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  let w, h, dust = [];
  function resize(){ w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
  resize(); addEventListener('resize', resize);
  for(let i=0;i<26;i++){
    dust.push({
      x:Math.random()*w, y:h + Math.random()*h,
      r:1+Math.random()*2.4, s:.18+Math.random()*.35,
      a:Math.random()*Math.PI*2, o:.15+Math.random()*.45
    });
  }
  (function loop(){
    if(letterOverlay.classList.contains('open')){
      ctx.clearRect(0,0,w,h);
      dust.forEach(p=>{
        p.y -= p.s; p.a += .015; p.x += Math.sin(p.a)*.3;
        if(p.y < -10){ p.y = h + 10; p.x = Math.random()*w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(193,154,73,'+p.o+')';
        ctx.shadowColor = 'rgba(232,210,160,.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      });
    }
    requestAnimationFrame(loop);
  })();
}

/* ---------------- reveal on scroll ---------------- */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ---------------- falling jasmine petals (intro only) ---------------- */
(function(){
  const c = document.getElementById('petals');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  let w, h, petals = [];
  function resize(){ w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
  resize(); addEventListener('resize', resize);
  for(let i=0;i<22;i++){
    petals.push({x:Math.random()*w, y:Math.random()*h, r:2+Math.random()*4,
                 s:.25+Math.random()*.5, a:Math.random()*Math.PI*2, o:.2+Math.random()*.5});
  }
  (function draw(){
    ctx.clearRect(0,0,w,h);
    petals.forEach(p=>{
      p.y += p.s; p.a += .01; p.x += Math.sin(p.a)*.4;
      if(p.y > h+10){ p.y = -10; p.x = Math.random()*w; }
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r*1.7, p.a, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,240,215,'+p.o+')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

/* ---------------- music wiring ----------------
   إن وضعتم ملف "music.mp3" بجانب index.html سيُشغَّل تلقائياً بدل الموسيقى المولّدة.
   إعدادات الموسيقى المولَّدة (النوع، السرعة، الصوت) في ملف js/music.js */
const musicBtn = document.getElementById('musicBtn');
const track = document.getElementById('track');
let useFile = false, on = false, fadeTimer = null;

track.addEventListener('canplay', ()=>{ useFile = true; }, {once:true});
track.addEventListener('error', ()=>{ useFile = false; });

function paint(){ musicBtn.classList.toggle('playing', on); }

function fadeTo(target){
  clearInterval(fadeTimer);
  fadeTimer = setInterval(()=>{
    const step = target > track.volume ? .04 : -.04;
    track.volume = Math.min(1, Math.max(0, +(track.volume + step).toFixed(2)));
    if(Math.abs(track.volume - target) < .05){
      track.volume = target; clearInterval(fadeTimer);
      if(target === 0) track.pause();
    }
  }, 90);
}

function startMusic(){
  try{
    if(useFile || track.readyState > 2){
      track.volume = 0;
      track.play().then(()=>{ useFile = true; on = true; fadeTo(.55); paint(); })
                  .catch(()=>{ Music.start(); on = Music.playing; paint(); });
    } else {
      Music.start(); on = Music.playing; paint();
    }
  }catch(e){}
}

function toggleMusic(){
  try{
    if(on){
      if(useFile) fadeTo(0); else Music.stop();
      on = false;
    } else {
      startMusic(); return;
    }
    paint();
  }catch(e){}
}