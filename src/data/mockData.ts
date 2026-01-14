import { NewsArticle, Comment, Ad } from "@/types/news";

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Economia brasileira cresce 2,5% no primeiro trimestre e supera expectativas do mercado",
    excerpt: "PIB do país apresenta recuperação acima do esperado, impulsionado pelo setor de serviços e agronegócio.",
    content: `O Produto Interno Bruto (PIB) brasileiro cresceu 2,5% no primeiro trimestre de 2026, superando as expectativas dos analistas de mercado que projetavam alta de 1,8%.

O resultado foi impulsionado principalmente pelo setor de serviços, que avançou 3,2%, e pelo agronegócio, que registrou crescimento de 4,1% no período.

"Os números mostram uma economia resiliente, capaz de se adaptar aos desafios globais", afirmou o ministro da Fazenda em coletiva de imprensa.

O setor industrial também apresentou recuperação, com alta de 1,5% após dois trimestres de retração. A construção civil foi destaque, com crescimento de 2,8%.

Analistas preveem que o país pode encerrar 2026 com crescimento acumulado de 3%, o que seria o melhor resultado em cinco anos.`,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    category: "Economia",
    author: "Maria Santos",
    publishedAt: new Date("2026-01-12T08:00:00"),
    isBreaking: true,
    views: 45230
  },
  {
    id: "2",
    title: "Nova tecnologia de energia solar promete revolucionar o setor energético",
    excerpt: "Pesquisadores brasileiros desenvolvem painel solar com eficiência 40% maior que modelos atuais.",
    content: `Uma equipe de pesquisadores da Universidade de São Paulo desenvolveu uma nova tecnologia de painéis solares que promete aumentar em 40% a eficiência na captação de energia solar.

O projeto, que levou cinco anos para ser concluído, utiliza uma combinação inovadora de materiais semicondutores que permite maior absorção de luz solar.

"Esta descoberta pode reduzir significativamente os custos de energia renovável no país", explicou a coordenadora do projeto.`,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
    category: "Tecnologia",
    author: "Carlos Oliveira",
    publishedAt: new Date("2026-01-12T07:30:00"),
    views: 23450
  },
  {
    id: "3",
    title: "Seleção Brasileira convoca jogadores para eliminatórias da Copa do Mundo",
    excerpt: "Técnico anuncia lista com 26 atletas para os próximos jogos das eliminatórias.",
    content: `A Confederação Brasileira de Futebol divulgou a lista de convocados para os próximos jogos das eliminatórias da Copa do Mundo de 2026.

O técnico da seleção optou por mesclar jogadores experientes com jovens talentos, apostando em renovação gradual do elenco.

Entre as novidades, destaque para o atacante do Flamengo que vive grande fase no Campeonato Brasileiro.`,
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    category: "Esportes",
    author: "Pedro Lima",
    publishedAt: new Date("2026-01-12T06:45:00"),
    views: 67890
  },
  {
    id: "4",
    title: "Ministério da Saúde lança campanha nacional de vacinação",
    excerpt: "Nova campanha visa imunizar 90% da população contra doenças sazonais.",
    content: `O Ministério da Saúde lançou hoje uma ampla campanha de vacinação que pretende imunizar 90% da população brasileira contra doenças sazonais.

A campanha terá início na próxima semana e contará com postos de vacinação em todo o território nacional.`,
    imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800",
    category: "Saúde",
    author: "Ana Rodrigues",
    publishedAt: new Date("2026-01-11T18:00:00"),
    views: 34567
  },
  {
    id: "5",
    title: "Festival de música reúne milhares de pessoas no Rio de Janeiro",
    excerpt: "Evento celebra a diversidade musical brasileira com artistas de todo o país.",
    content: `O maior festival de música do ano reuniu mais de 100 mil pessoas na Praia de Copacabana neste fim de semana.

O evento contou com apresentações de artistas consagrados e novos talentos, celebrando a riqueza da música brasileira.`,
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    category: "Entretenimento",
    author: "Lucas Ferreira",
    publishedAt: new Date("2026-01-11T15:30:00"),
    views: 28900
  },
  {
    id: "6",
    title: "Previsão do tempo: onda de calor atinge região Sudeste",
    excerpt: "Temperaturas podem chegar a 42°C em algumas capitais nos próximos dias.",
    content: `Uma intensa onda de calor deve atingir a região Sudeste do Brasil nos próximos dias, com temperaturas que podem superar os 42°C em algumas capitais.

Meteorologistas recomendam hidratação constante e evitar exposição ao sol nas horas mais quentes do dia.`,
    imageUrl: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800",
    category: "Clima",
    author: "Fernanda Costa",
    publishedAt: new Date("2026-01-11T12:00:00"),
    views: 19876
  },
  {
    id: "7",
    title: "Startup brasileira recebe investimento milionário de fundo internacional",
    excerpt: "Empresa de tecnologia financeira capta R$ 500 milhões para expansão.",
    content: `Uma startup brasileira do setor de tecnologia financeira anunciou a captação de R$ 500 milhões em uma rodada de investimentos liderada por um fundo internacional.

O aporte será utilizado para expandir as operações da empresa para outros países da América Latina.`,
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800",
    category: "Negócios",
    author: "Roberto Alves",
    publishedAt: new Date("2026-01-11T10:00:00"),
    views: 15432
  },
  {
    id: "8",
    title: "Congresso aprova nova lei de proteção ambiental",
    excerpt: "Legislação prevê multas mais rigorosas para crimes ambientais.",
    content: `O Congresso Nacional aprovou uma nova lei de proteção ambiental que estabelece multas mais rigorosas para crimes contra o meio ambiente.

A legislação também cria novos mecanismos de fiscalização e incentivos para práticas sustentáveis.`,
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    category: "Política",
    author: "Juliana Mendes",
    publishedAt: new Date("2026-01-10T16:00:00"),
    views: 12345
  }
];

export const mockComments: Comment[] = [
  {
    id: "1",
    articleId: "1",
    author: "João Silva",
    content: "Excelente notícia para a economia brasileira! Esperamos que esse crescimento se mantenha.",
    createdAt: new Date("2026-01-12T09:30:00"),
    likes: 45
  },
  {
    id: "2",
    articleId: "1",
    author: "Maria Fernanda",
    content: "Precisamos de mais investimentos em infraestrutura para sustentar esse crescimento.",
    createdAt: new Date("2026-01-12T10:15:00"),
    likes: 32
  },
  {
    id: "3",
    articleId: "1",
    author: "Carlos Eduardo",
    content: "O setor de serviços está realmente puxando a economia. Ótimo sinal!",
    createdAt: new Date("2026-01-12T11:00:00"),
    likes: 28
  }
];

export const mockAds: Ad[] = [
  {
    id: "1",
    title: "Banco Digital - Conta sem taxas",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
    link: "#",
    position: "sidebar",
    isActive: true
  },
  {
    id: "2",
    title: "Curso de Programação Online",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    link: "#",
    position: "banner",
    isActive: true
  },
  {
    id: "3",
    title: "Seguro Auto - Cotação Grátis",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    link: "#",
    position: "inline",
    isActive: true
  },
  {
    id: "4",
    title: "Loja de Eletrônicos",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400",
    link: "#",
    position: "sidebar",
    isActive: true
  },
  {
    id: "5",
    title: "Viagens Internacionais",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    link: "#",
    position: "banner",
    isActive: true
  },
  {
    id: "6",
    title: "Academia Fitness",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    link: "#",
    position: "inline",
    isActive: true
  },
  {
    id: "7",
    title: "Restaurante Delivery",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    link: "#",
    position: "sidebar",
    isActive: true
  }
];

export const categories = [
  "Economia",
  "Política",
  "Esportes",
  "Tecnologia",
  "Saúde",
  "Entretenimento",
  "Negócios",
  "Clima",
  "Internacional",
  "Educação",
  "Ciência",
  "Cultura"
];

// Ad position specifications for admin
export const adPositionSpecs = {
  sidebar: {
    label: "Barra Lateral",
    width: 300,
    height: 250,
    description: "Exibido na lateral direita do site",
  },
  banner: {
    label: "Banner Principal",
    width: 728,
    height: 90,
    description: "Exibido no topo do conteúdo principal",
  },
  inline: {
    label: "Dentro do Conteúdo",
    width: 468,
    height: 120,
    description: "Exibido entre as notícias",
  },
};
