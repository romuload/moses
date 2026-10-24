# EXODUS. | Moisés, a abertura do Mar

Experiência cinematográfica em português feita com React, TypeScript, Vite, GSAP ScrollTrigger e Lucide. Tipografia Geist servida localmente.

## Executar

Node.js 20.19+.

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Material usado

Vídeo selecionado nas duas versões: `video-moises.mp4` (720×1280, 24 fps, 13 segundos úteis, com o clarão final do original removido). Desktop usa `public/videos/moises-v3.mp4`, sem áudio e com keyframes a cada seis frames. Celular usa 104 frames WebP de 360×640 em `public/frames/moises-v3`, com interpolação, três carregamentos simultâneos e resolução de canvas limitada a 1,5×. Capa, encerramento e capítulos `moises-v2-*` vêm da mesma fonte.

- `public/images/moises-v2-hero.webp`: capa extraída do novo vídeo.
- `public/images/moises-v3-ending.webp`: encerramento da mesma cena.
- `public/images/moises-v2-chapter-*.webp`: cenas para leitura com movimento reduzido.

Os originais na raiz permanecem intactos. A prévia do próximo episódio é editorial e marcada como “Em breve”.

## Arquitetura e comportamento

`src/content.ts` centraliza capítulos, textos, ícones e pontos de entrada. `src/components/FeatureCards.tsx` contém os cartões reutilizáveis. `src/App.tsx` coordena a sequência, navegação, estados de mídia e encerramento. `src/styles.css` concentra tokens de cor, espaçamento, materiais, tipografia, camadas e responsividade.

Um único timeline do GSAP fixa o palco por 550vh de rolagem. Os primeiros 14% dissolvem a interface da capa; os 86% restantes percorrem a duração real do vídeo. O vídeo fica pausado, sem autoplay. Um único controlador requestAnimationFrame suaviza o destino e atribui `currentTime` apenas quando a busca anterior terminou. O progresso narrativo acompanha o frame decodificado. A rolagem não atualiza estado React. O contexto GSAP, frame e listeners são limpos no unmount.

Os cinco marcadores saltam para posições da mesma sequência. Cartões invisíveis não recebem foco; capítulos têm rótulos acessíveis. Com `prefers-reduced-motion: reduce`, não há pin nem scrubbing: cinco capítulos ilustrados aparecem no fluxo normal. Falha de vídeo também oferece leitura estática. A interface permite pular a experiência e revê-la. Sem áudio, pois buscar tempos continuamente não oferece reprodução sonora coerente.

No celular, a mídia usa object-fit cover para preencher o palco e os cartões da capa formam uma faixa horizontal acessível por toque ou teclado. O enquadramento é recortado proporcionalmente, mantendo o centro da ação. Os cartões narrativos ficam na parte inferior.

## Preparar outro vídeo

Ao trocar a fonte, regenere o MP4 com `-an -g 6 -keyint_min 6 -sc_threshold 0 -movflags +faststart`, a sequência móvel com `fps=8,scale=360:640`, a capa e as imagens de capítulos. Atualize `FRAME_COUNT`, os caminhos versionados em `src/App.tsx`, o preload em `index.html` e os tempos em `src/content.ts`. O novo prefixo evita misturar mídia antiga em cache com a nova sequência.

## Publicação

Execute `npm run build` e publique o diretório `dist` em um host estático. Sirva MP4 como `video/mp4` com suporte a HTTP Range (respostas 206); não comprima MP4 com gzip. Use cache longo nos assets com hash. Configure Vite `base` caso publique em subdiretório. Nenhum serviço externo ou variável de ambiente é necessário.

## Verificação

```sh
npx playwright install chromium
npm test
```

Os testes verificam carregamento de mídia, salto e retorno temporal, ausência de overflow no celular e a alternativa com movimento reduzido. O build inclui a verificação TypeScript.
