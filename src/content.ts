import { Waves, Wind, Footprints, Sparkles, MoveUpRight } from 'lucide-react';
export const chapters = [
 { label: 'A MARGEM', title: 'O impossível diante deles', text: 'Diante do Mar Vermelho, Moisés e seu povo aguardam. O horizonte parece não oferecer saída.', icon: Waves, start: 0 },
 { label: 'O CAJADO', title: 'Um gesto de fé', text: 'Moisés ergue o cajado. O vento começa a soprar, e as águas respondem.', icon: MoveUpRight, start: .08 },
 { label: 'O MILAGRE', title: 'O mar se abre', text: 'Duas muralhas de água se erguem, revelando um caminho pelo fundo do mar.', icon: Wind, start: .22 },
 { label: 'O CAMINHO', title: 'Entre as águas', text: 'Um caminho surge onde antes existia apenas o oceano.', icon: Sparkles, start: .48 },
 { label: 'A TRAVESSIA', title: 'O caminho da liberdade', text: 'Diante do povo, o caminho está aberto. Uma nova jornada se torna possível.', icon: Footprints, start: .82 },
];
export const features = [
 { label: 'O DESAFIO', title: 'Diante do impossível', text: 'Um povo diante do mar. Atrás deles, o passado. À frente, um caminho que ainda não existe.', icon: Waves, chapter: 0 },
 { label: 'O MILAGRE', title: 'As águas se dividem', text: 'Moisés ergue o cajado. O vento sopra e o mar começa a revelar um caminho.', icon: Wind, chapter: 2 },
 { label: 'A TRAVESSIA', title: 'O caminho da liberdade', text: 'Entre muralhas de água, um caminho se abre diante do povo rumo à liberdade.', icon: Footprints, chapter: 4 },
];
