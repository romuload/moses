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

Vídeo selecionado: `Moses_parts_the_Red_Sea_20260929222252.mp4`.
Os dois vídeos fornecidos têm aproximadamente **10 segundos**, não os 15 descritos no briefing. A edição original foi preservada: não adicionamos câmera, cenas, pessoas ou movimentos ausentes. O arquivo selecionado mostra a abertura das águas e a entrada do povo, mas não executa a rotação de 180 graus descrita no briefing. A imagem `Imagem-inicial.jpg`, adicionada durante o desenvolvimento, fornece a capa em maior resolução. Ela corresponde à composição do primeiro frame e se dissolve sobre o vídeo. Não foi fornecida a captura de tela do layout mencionada no briefing. Não há imagens geradas ou footage externo.

- `public/images/moses-hero.webp`: imagem fornecida em WebP, mesma composição do vídeo.
- `public/images/moses-ending.webp`: frame final.
- `public/images/chapter-*.webp`: cenas para leitura com movimento reduzido.
- `public/videos/moses-red-sea.mp4`: H.264, 1280×720, sem áudio.
- `public/videos/moses-red-sea-mobile.mp4`: versão leve 960×540, sem áudio.

Os originais na raiz permanecem intactos. A prévia do próximo episódio é editorial e marcada como “Em breve”; não há um episódio adicional disponível.

## Arquitetura e comportamento

`src/content.ts` centraliza capítulos, textos, ícones e pontos de entrada. `src/components/FeatureCards.tsx` contém os cartões reutilizáveis. `src/App.tsx` coordena a sequência, navegação, estados de mídia e encerramento. `src/styles.css` concentra tokens de cor, espaçamento, materiais, tipografia, camadas e responsividade.

Um único timeline do GSAP fixa o palco por 550vh de rolagem. Os primeiros 14% dissolvem a interface da capa; os 86% restantes percorrem a duração real do vídeo. O vídeo fica pausado, sem autoplay. Um único controlador requestAnimationFrame suaviza o destino e atribui `currentTime` apenas quando a busca anterior terminou. O progresso narrativo acompanha o frame decodificado. A rolagem não atualiza estado React. O contexto GSAP, frame e listeners são limpos no unmount.

Os cinco marcadores saltam para posições da mesma sequência. Cartões invisíveis não recebem foco; capítulos têm rótulos acessíveis. Com `prefers-reduced-motion: reduce`, não há pin nem scrubbing: cinco capítulos ilustrados aparecem no fluxo normal. Falha de vídeo também oferece leitura estática. A interface permite pular a experiência e revê-la. Sem áudio, pois buscar tempos continuamente não oferece reprodução sonora coerente.

No celular, a mídia usa object-fit cover para preencher o palco e os cartões da capa formam uma faixa horizontal acessível por toque ou teclado. O enquadramento é recortado proporcionalmente, mantendo o centro da ação. Os cartões narrativos ficam na parte inferior.

## Preparar outro vídeo

O projeto inclui `ffmpeg-static` como dependência de desenvolvimento. Keyframes a cada 6 frames permitem buscas curtas; para aparelhos mais lentos, `-g 1` dá acesso a cada frame, com custo de arquivo maior.

```sh
node_modules/ffmpeg-static/ffmpeg -i original.mp4 -an \
  -c:v libx264 -preset fast -crf 19 -g 6 -keyint_min 6 \
  -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  public/videos/moses-red-sea.mp4

node_modules/ffmpeg-static/ffmpeg -i original.mp4 -an -vf scale=960:-2 \
  -c:v libx264 -preset fast -crf 22 -g 6 -keyint_min 6 \
  -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  public/videos/moses-red-sea-mobile.mp4

node_modules/ffmpeg-static/ffmpeg -i original.mp4 -frames:v 1 public/images/moses-hero.webp
```

Ao trocar o vídeo, atualize os frames de capítulos e os valores `start` em `src/content.ts`. Os valores são frações da duração, não segundos fixos. Ajuste o enquadramento em `.cinematic-media` se o sujeito mudar de posição.

## Publicação

Execute `npm run build` e publique o diretório `dist` em um host estático. Sirva MP4 como `video/mp4` com suporte a HTTP Range (respostas 206); não comprima MP4 com gzip. Use cache longo nos assets com hash. Configure Vite `base` caso publique em subdiretório. Nenhum serviço externo ou variável de ambiente é necessário.

## Verificação

```sh
npx playwright install chromium
npm test
```

Os testes verificam carregamento de mídia, salto e retorno temporal, ausência de overflow no celular e a alternativa com movimento reduzido. O build inclui a verificação TypeScript.
