// Scroll-scrubbed image sequence drawn on a canvas. Mobile browsers (iOS Safari
// in particular) seek <video> too slowly for smooth scrubbing; drawing decoded
// frames is instant. Adjacent frames are cross-faded so a 12fps sequence still
// reads as continuous motion.

type Options = { count: number; src: (index: number) => string; focusX: number; onFirstFrame: () => void; onError: () => void };

export function createFrameSequence(canvas: HTMLCanvasElement, { count, src, focusX, onFirstFrame, onError }: Options) {
 const ctx = canvas.getContext('2d', { alpha: false })!;
 const frames: (HTMLImageElement | null)[] = Array(count).fill(null);
 let progress = 0, dirty = true, disposed = false;

 // Coarse-to-fine load order: a sparse pass first so any scroll position has a
 // nearby frame early, then the gaps fill in.
 const order: number[] = [];
 for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
 if (!order.includes(count - 1)) order.splice(1, 0, count - 1);

 let next = 0;
 const loadNext = () => {
  if (disposed || next >= order.length) return;
  const index = order[next++];
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
   img.decode().catch(() => {}).finally(() => {
    if (disposed) return;
    frames[index] = img;
    dirty = true;
    if (index === 0) onFirstFrame();
    loadNext();
   });
  };
  img.onerror = () => { if (index === 0) onError(); else loadNext(); };
  img.src = src(index);
 };
 for (let i = 0; i < 4; i++) loadNext();

 const nearest = (index: number) => {
  for (let d = 0; d < count; d++) {
   if (frames[index - d]) return frames[index - d];
   if (frames[index + d]) return frames[index + d];
  }
  return null;
 };

 const resize = () => {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
 };
 resize();
 const observer = new ResizeObserver(resize);
 observer.observe(canvas);

 const drawCover = (img: HTMLImageElement, alpha: number) => {
  const { width: cw, height: ch } = canvas;
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (cw - w) * focusX, (ch - h) / 2, w, h);
 };

 return {
  set(value: number) { if (value !== progress) { progress = value; dirty = true; } },
  render() {
   if (!dirty) return;
   const position = progress * (count - 1);
   const a = Math.floor(position), b = Math.min(count - 1, a + 1), t = position - a;
   const base = nearest(a);
   if (!base) return;
   dirty = false;
   drawCover(base, 1);
   const blend = frames[b];
   if (blend && blend !== base && t > .01) drawCover(blend, t);
   ctx.globalAlpha = 1;
  },
  dispose() { disposed = true; observer.disconnect(); },
 };
}
