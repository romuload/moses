import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X, RotateCcw, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from './content';
import { FeatureCards } from './components/FeatureCards';
import { createFrameSequence } from './frameSequence';
const asset = (path: string) => import.meta.env.BASE_URL + path;
gsap.registerPlugin(ScrollTrigger);
// Mobile browser bars resize the viewport while scrolling; don't re-layout the pin for that.
ScrollTrigger.config({ ignoreMobileResize: true });
const FRAME_COUNT = 120;
const number = (i: number) => String(i + 1).padStart(2, '0');

export default function App() {
 const root = useRef<HTMLDivElement>(null);
 const video = useRef<HTMLVideoElement>(null);
 const canvas = useRef<HTMLCanvasElement>(null);
 const trigger = useRef<ScrollTrigger | null>(null);
 // Touch devices scrub a canvas image sequence; seeking <video> per scroll step is too slow there.
 const [useFrames] = useState(() => matchMedia('(max-width: 767px), (pointer: coarse)').matches);
 const [menu, setMenu] = useState(false);
 const [loaded, setLoaded] = useState(false);
 const [failed, setFailed] = useState(false);
 const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const change = () => setReduced(media.matches);
  media.addEventListener('change', change);
  return () => media.removeEventListener('change', change);
 }, []);
 const goChapter = (i: number) => {
  setMenu(false);
  if (reduced || failed) { document.getElementById(`static-${i}`)?.scrollIntoView(); return; }
  const st = trigger.current;
  if (st) window.scrollTo({ top: st.start + (st.end - st.start) * (.14 + .86 * Math.min(chapters[i].start + .015, 1)), behavior: 'smooth' });
 };
 useEffect(() => {
  if (reduced || failed || !root.current || !(useFrames ? canvas.current : video.current)) return;
  const el = video.current;
  const sequence = useFrames ? createFrameSequence(canvas.current!, {
   count: FRAME_COUNT,
   src: i => asset(`frames/${String(i + 1).padStart(3, '0')}.webp`),
   focusX: matchMedia('(max-width: 767px)').matches ? .3 : .58,
   onFirstFrame: () => setLoaded(true),
   onError: () => setFailed(true),
  }) : null;
  let target = 0, smoothed = 0, raf = 0, last = -1;
  const cards = [...root.current.querySelectorAll<HTMLElement>('.narrative')];
  const markers = [...root.current.querySelectorAll<HTMLButtonElement>('.chapter-marker')];
  const fullProgress = root.current.querySelector<HTMLElement>('.film-progress span')!;
  const hero = root.current.querySelector<HTMLElement>('.hero-content')!;
  const featureRow = root.current.querySelector<HTMLElement>('.feature-grid')!;
  const hud = root.current.querySelector<HTMLElement>('.film-hud')!;
  const ctx = gsap.context(() => {
   const tl = gsap.timeline({scrollTrigger: { trigger: '.cinema', start: 'top top', end: () => `+=${innerHeight * 5.5}`, pin: true, scrub: true, invalidateOnRefresh: true,
    onUpdate: self => {
     const p = Math.max(0, Math.min(1, (self.progress - .14) / .86));
     target = p;
     const cinematic = self.progress > .125;
     hero.inert = self.progress > .1;
     featureRow.inert = self.progress > .1;
     hud.inert = !cinematic;
     hud.style.opacity = cinematic ? '1' : '0';
     fullProgress.style.transform = `scaleX(${p})`;
    }
   }});
   tl.to('.hero-copy', { opacity: 0, y: -45, duration: .09 }, 0)
     .to('.feature-card', {opacity: 0, y: 30, stagger: .012, duration: .075}, .015)
     .to('.hero-poster', {opacity: 0, duration: .10}, 0)
     .to('.hero-shade', {opacity: .12, duration: .14}, 0)
     .to('.topbar', {opacity: .55, duration: .14}, 0)
     .to('.cinematic-media', {scale: 1, duration: .14}, 0)
     .to({}, {duration: .86});
   trigger.current = tl.scrollTrigger!;
  }, root);
  const frame = () => {
   smoothed += (target - smoothed) * .16;
   if (Math.abs(target - smoothed) < .0001) smoothed = target;
   let displayed = smoothed;
   if (sequence) { sequence.set(smoothed); sequence.render(); }
   else if (el) {
    if (el.readyState >= 2 && Number.isFinite(el.duration) && !el.seeking) {
     const time = smoothed * Math.max(0, el.duration - .045);
     if (Math.abs(el.currentTime - time) > .025) el.currentTime = time;
    }
    if (el.duration > 0) displayed = el.currentTime / el.duration;
   }
   const active = chapters.reduce((found, c, index) => displayed >= c.start ? index : found, 0);
   const i = Math.max(0, active);
   const visible = target > .002;
   if (last !== i || cards[i].classList.contains('active') !== visible) {
    cards.forEach((card, n) => { card.classList.toggle('active', n === i && visible); card.setAttribute('aria-hidden', String(n !== i || !visible)); });
    markers.forEach((marker, n) => { marker.classList.toggle('active', n === i); marker.setAttribute('aria-current', n === i ? 'step' : 'false'); });
    last = i;
   }
   const end = chapters[i+1]?.start ?? 1;
   cards[i].style.setProperty('--chapter-progress', String(Math.min(1, Math.max(0, (displayed - chapters[i].start) / (end - chapters[i].start)))));
   raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  const refresh = () => ScrollTrigger.refresh();
  el?.addEventListener('loadedmetadata', refresh);
  document.fonts.ready.then(refresh);
  return () => { cancelAnimationFrame(raf); sequence?.dispose(); el?.removeEventListener('loadedmetadata', refresh); ctx.revert(); trigger.current = null; };
 }, [reduced, failed, useFrames]);
 useEffect(() => { const escape = (e: KeyboardEvent) => { if(e.key === 'Escape') setMenu(false); }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, []);
 return <div ref={root}>
  <a className="skip-link" href="#ending">Pular experiência</a>
  <section className="cinema" id="historias" aria-label="Moisés, a abertura do Mar">
   <div className="cinematic-media">
    {reduced ? <img src={asset("images/moses-hero.webp")} alt="Moisés diante do Mar Vermelho, entre o povo e as águas" /> : useFrames ? <canvas ref={canvas} role="img" aria-label="Cena cinematográfica de Moisés abrindo o mar; controlada pela rolagem"></canvas> : <video ref={video} src={asset("videos/moses-red-sea.mp4")} muted playsInline preload="auto" poster={asset("images/moses-hero.webp")} onLoadedData={() => setLoaded(true)} onError={() => setFailed(true)} aria-label="Cena cinematográfica de Moisés abrindo o mar; controlada pela rolagem"></video>}
   </div>
   {!reduced && <img className="hero-poster" src={asset("images/moses-hero.webp")} alt="Moisés diante do mar e da multidão" fetchPriority="high"/>}
   <div className="hero-shade"/><div className="edge-shade"/>
   <header className="topbar"><a className="wordmark" href="#historias" onClick={() => window.scrollTo({top:0,behavior:reduced?'instant':'smooth'})}>EXODUS<span>.</span></a><nav aria-label="Navegação principal"><a href="#historias">Histórias</a><a href="#episodios">Episódios</a><a href="#sobre">Sobre</a><button className="menu-toggle" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} aria-controls="chapter-menu" onClick={() => setMenu(!menu)}>{menu ? <X size={21}/> : <Menu size={21}/>}</button></nav></header>
   {menu && <nav id="chapter-menu" className="chapter-menu glass" aria-label="Capítulos">{chapters.map((c,i)=><button key={c.label} onClick={()=>goChapter(i)}><span>{number(i)}</span>{c.title}<ArrowUpRight size={16}/></button>)}</nav>}
   <div className="hero-content"><div className="hero-copy"><div className="eyebrow">// EPISÓDIO 03</div><h1>Moisés.<br/>A abertura<br/>do Mar.</h1><p>Um mar intransponível. Um povo em busca de liberdade. O instante em que o impossível se tornou caminho.</p><button className="begin" onClick={()=>goChapter(0)}><span className="round-icon"><ArrowDown size={18}/></span>Entre na história</button></div></div>
   <FeatureCards onSelect={goChapter}/>
   {!reduced && <div className="film-hud" inert><div className="film-label">EXODUS / MOISÉS<span>UMA JORNADA ATRAVÉS DO IMPOSSÍVEL</span></div>{chapters.map((c,i)=><article className={`narrative glass ${i%2 ? 'right' : 'left'}`} aria-hidden="true" key={c.label}><div className="card-top"><c.icon size={23}/><span>{number(i)} / {c.label}</span></div><h2>{c.title}</h2><p>{c.text}</p><div className="chapter-progress"><span/></div></article>)}<nav className="chapter-nav" aria-label="Progresso dos capítulos">{chapters.map((c,i)=><button className="chapter-marker" key={c.label} onClick={()=>goChapter(i)} aria-label={`Capítulo ${i+1}: ${c.title}`}><span>{number(i)}</span><i/></button>)}</nav><a className="skip-film" href="#ending">Ir ao desfecho <ArrowRight size={14}/></a><div className="film-progress"><span/></div></div>}
   {!loaded && !reduced && <div className="media-status" role="status">{failed ? 'Vídeo indisponível. A história continua em texto.' : 'Preparando a experiência…'}</div>}
  </section>
  {(reduced || failed) && <section className="static-chapters" aria-label="A história em cinco capítulos">{chapters.map((c,i)=><article id={`static-${i}`} key={c.label}><img src={asset(`images/chapter-${i+1}.webp`)} alt={`Cena do capítulo: ${c.title}`} loading="lazy"/><div><span className="eyebrow">{number(i)} / {c.label}</span><h2>{c.title}</h2><p>{c.text}</p></div></article>)}</section>}
  <section className="ending" id="ending"><div className="ending-copy" id="sobre"><span className="eyebrow">DO OUTRO LADO, UM NOVO COMEÇO</span><h2>O impossível<br/>se tornou <span>caminho.</span></h2><p>Uma história sobre coragem, liberdade e o primeiro passo diante do desconhecido.</p><button className="replay" onClick={()=>{window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});}}><RotateCcw size={17}/> Reviver a história</button></div><div className="episode-preview glass" id="episodios"><img src={asset("images/moses-ending.webp")} alt="O caminho aberto entre as águas do mar" loading="lazy"/><div><span className="eyebrow">A JORNADA CONTINUA</span><h3>Além do mar.</h3><p>O próximo capítulo desta jornada.</p><span className="coming-soon">PRÓXIMO EPISÓDIO · EM BREVE</span></div></div></section>
  <footer><a className="wordmark" href="#historias">EXODUS<span>.</span></a><p>Histórias que atravessam o tempo.</p><a href="#historias">Voltar ao início <ArrowUpRight size={15}/></a></footer>
 </div>;
}
