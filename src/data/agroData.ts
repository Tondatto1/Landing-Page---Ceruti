import { Testimonial, VideoTestimonial, AgroSegment, TrustedCompany, FaqItem } from '../types';

export const HERO_STATS = [
  { value: '+20.000', label: 'Alunos Capacitados no Agro' },
  { value: '98,7%', label: 'Índice de Satisfação de Clientes' },
  { value: '+19 Anos', label: 'de Liderança em Capacitação Agro' },
  { value: '+1B', label: 'em Vendas Incrementais Geradas' },
];

export const AGRO_SEGMENTS: AgroSegment[] = [
  {
    id: 'roi',
    title: '+ROI',
    subtitle: 'Demonstração clara do retorno sobre investimento por hectare para o produtor',
    iconName: 'TrendingUp',
    description: 'Capacite sua força comercial a defender o retorno financeiro da recomendação técnica, mostrando exatamente os ganhos por hectare.',
    challenges: [
      'Dificuldade em provar o valor financeiro das tecnologias',
      'Produtor focado somente no custo inicial dos insumos',
      'Falta de argumentos para defender soluções de alto valor'
    ],
    results: [
      'Demonstração clara do ROI por saca e por hectare',
      'Aumento na aceitação de pacotes tecnológicos avançados',
      'Maior valor percebido na consultoria técnica do seu time'
    ],
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'margem',
    title: '+MARGEM',
    subtitle: 'Proteção de margem e fuga do leilão e guerra de preços no balcão e no campo',
    iconName: 'Percent',
    description: 'Elimine a guerra de preços e os descontos excessivos ensinando tecnicas de negociação que blindam a margem de lucro da empresa.',
    challenges: [
      'Guerra de preços e margens espremidas com a concorrência',
      'Vendedores que cedem desconto logo na primeira objeção',
      'Commoditização da linha de produtos e serviços'
    ],
    results: [
      'Aumento médio de 32% na margem bruta das negociações',
      'Blindagem contra leilão de preços de concorrentes',
      'Venda de especialidades e biológicos com margem superior'
    ],
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'vendas',
    title: '+VENDAS',
    subtitle: 'Aumento na conversão de visitas, abertura de clientes e vendas cruzadas',
    iconName: 'BarChart3',
    description: 'Acelere o ritmo de fechamentos e expanda a área atendida em grandes produtores com uma abordagem proativa e consultiva.',
    challenges: [
      'Ciclos de negociação longos e visitas sem fechamento',
      'Baixa taxa de conversão em novos produtores da região',
      'Dificuldade de realizar vendas cruzadas (cross-selling)'
    ],
    results: [
      'Redução no tempo médio do ciclo de vendas no campo',
      'Prospecção estruturada de grandes produtores rurais',
      'Aumento na taxa de conversão de visitas presenciais'
    ],
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'faturamento',
    title: '+FATURAMENTO',
    subtitle: 'Crescimento escalável e previsibilidade de receita safra após safra',
    iconName: 'CircleDollarSign',
    description: 'Estruture uma operação de vendas de alta performance com metas claras, fidelização e previsibilidade de faturamento.',
    challenges: [
      'Oscilações imprevisíveis no faturamento entre safras',
      'Perda de clientes para concorrentes ao final do ciclo',
      'Falta de padronização no processo comercial da equipe'
    ],
    results: [
      'Crescimento consistente e previsível do faturamento',
      'Aumento do share of wallet na carteira de clientes',
      'Fidelização de longo prazo com o produtor rural'
    ],
    image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Carlos Eduardo Silveira',
    role: 'Diretor Comercial',
    company: 'AgroSul Distribuidora de Insumos',
    category: 'revenda',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    quote: 'Treinamos nossos 42 RTVs com o Método PCP. Em apenas duas safras, dobramos o faturamento da empresa sem aumentar o tamanho da equipe. O foco em valor em vez de preço mudou o nosso negócio!',
    metrics: '+210% de faturamento em 2 safras',
    rating: 5
  },
  {
    id: '2',
    name: 'Mariana Fontes',
    role: 'Gerente Nacional de Vendas',
    company: 'Fertilizantes Serrana / BioAgro',
    category: 'industria',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    quote: 'A linguagem do programa é 100% voltada à realidade da roça. Não é teoria de escritório. Os vendedores saem prontos para negociar com grandes produtores de grãos e pecuaristas.',
    metrics: '+45% de conversão no primeiro trimestre',
    rating: 5
  },
  {
    id: '3',
    name: 'Eng. Agr. Fernando Alencar',
    role: 'Superintendente Comercial',
    company: 'Cooperativa Agroindustrial do Centro-Oeste',
    category: 'cooperativa',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    quote: 'Quebramos o tabu de que agrônomo não sabe vender. O Método PCP deu método e respeito técnico para nossos consultores fecharem pacotes completos de alta tecnologia.',
    metrics: '98,2% de adesão na carteira de cooperados',
    rating: 5
  },
  {
    id: '4',
    name: 'Rodrigo Balthazar',
    role: 'CEO e Fundador',
    company: 'Balthazar Agroconsultoria',
    category: 'consultoria',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    quote: 'Para quem atua no campo, saber vender é o divisor de águas entre cobrar barato ou ter agenda lotada. O treinamento nos ensinou a cobrar pelo valor gerado de produtividade.',
    metrics: '+380% em ticket médio por hectare',
    rating: 5
  }
];

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: 'v1',
    youtubeId: '_GYKnnSotwo',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v2',
    youtubeId: 'yQ84q7pWeio',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v3',
    youtubeId: '5k5C4zkThgE',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v4',
    youtubeId: 'caZB1cmenSI',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v5',
    youtubeId: 'i_gMp58OQ00',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v6',
    youtubeId: 'byd4QgVzHh4',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v7',
    youtubeId: 'L7ZL0U42LNU',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v8',
    youtubeId: 'EPyQmB0OBws',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v9',
    youtubeId: '7dFrZpq2Tfw',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v10',
    youtubeId: 'Xq1z6VZAwHM',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v11',
    youtubeId: 'm6EhFsH_Z08',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v12',
    youtubeId: 'm2IOWTTVi9c',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v13',
    youtubeId: '6ajkV5pbEPU',
    title: 'Agrovendedor',
    type: 'full',
  },
  {
    id: 'v14',
    youtubeId: 'Y0XfEYL-6mA',
    title: 'Agrovendedor',
    type: 'short',
  },
  {
    id: 'v15',
    youtubeId: 'IHnIjW6ePg0',
    title: 'Agrovendedor',
    type: 'short',
  }
];

export const TRUSTED_COMPANIES: TrustedCompany[] = [
  { name: 'Matsuda', category: 'Agro', logoText: 'MATSUDA', highlight: 'Parceiro PCP', logoUrl: '/logo matsuda.png' },
  { name: 'Grupo Bugio', category: 'Agro', logoText: 'GRUPO BUGIO', highlight: 'Parceiro PCP', logoUrl: '/logo bugio.png' },
  { name: 'Multirural', category: 'Agro', logoText: 'MULTIRURAL', highlight: 'Parceiro PCP', logoUrl: '/logo multitural.png' },
  { name: 'Fertimig', category: 'Agro', logoText: 'FERTIMIG', highlight: 'Parceiro PCP', logoUrl: '/logo fertimig.png' },
  { name: 'Auriverde', category: 'Agro', logoText: 'AURIVERDE', highlight: 'Parceiro PCP', logoUrl: '/logo auriverde.png' },
  { name: 'Gasparim', category: 'Agro', logoText: 'GASPARIM', highlight: 'Parceiro PCP', logoUrl: '/logo gasparim.png' },
  { name: 'Embreparts', category: 'Agro', logoText: 'EMBREPARTS', highlight: 'Parceiro PCP', logoUrl: '/logo embreparts.png' },
  { name: 'Guabi', category: 'Agro', logoText: 'GUABI', highlight: 'Parceiro PCP', logoUrl: '/logo guabi 1.png' },
  { name: 'Camisc', category: 'Agro', logoText: 'CAMISC', highlight: 'Parceiro PCP', logoUrl: '/logo camisc.png.png' },
  { name: 'DPR Agro', category: 'Agro', logoText: 'DPR AGRO', highlight: 'Parceiro PCP', logoUrl: '/logo DPR.png' },
];

export const METHOD_PCP_PILLARS = [
  {
    letter: 'P',
    title: 'PROSPECÇÃO & PLANEJAMENTO',
    subtitle: 'Mapeamento inteligente do território rural',
    description: 'Identificação dos produtores de maior potencial, planejamento de visita por potencial de hectare e inteligência de safra para abordagem no timing perfeito.',
    highlights: ['Análise de potencial por cultura', 'Mapeamento da carteira de produtores', 'Análise de ciclo e momento de compra do produtor']
  },
  {
    letter: 'C',
    title: 'CONEXÃO & VALOR CONSULTIVO',
    subtitle: 'Relacionamento técnico e superação de objeções',
    description: 'Transformação do vendedor em consultor estratégico. Demonstração prática do ROI em saca/hectare e quebra de objeções de preço e concorrência.',
    highlights: ['Cálculo de retorno para o produtor', 'Técnicas de escuta e diagnóstico no campo', 'Blindagem contra leilão de preços']
  },
  {
    letter: 'P',
    title: 'PERFORMANCE & FECHAMENTO',
    subtitle: 'Negociação de alto ticket e pós-venda técnico',
    description: 'Fechamento de contratos de alta margem, estruturação de propostas com prazos e modalidades (Barter/Crédito) e acompanhamento pós-venda para recompras.',
    highlights: ['Negociação de prazos e operações barter', 'Acompanhamento de resultados no campo', 'Fidelização e expansão de área contratada']
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    question: 'O treinamento é presencial ou online?',
    answer: 'Ambos! Oferecemos modelos 100% presenciais (com imersão in-company), 100% online interativos (aulas ao vivo e plataforma EAD) e também formatos híbridos sob medida. Adaptamos a estrutura para atender perfeitamente à rotina e logística da sua equipe comercial no campo.',
    category: 'formato'
  },
  {
    id: '2',
    question: 'Quando começamos a ver os resultados no time?',
    answer: 'Já na primeira semana! Normalmente, logo nos primeiros dias após o início do treinamento e implementação das técnicas do Método PCP, a equipe já apresenta evolução clara na abordagem técnica, argumentação de valor e conversão de vendas.',
    category: 'resultados'
  },
  {
    id: '3',
    question: 'Vocês atendem todo o Brasil?',
    answer: 'Sim! Atendemos empresas e equipes comerciais do agronegócio em todo o território nacional e América Latina, cobrindo todos os principais polos agrícolas com instrutores de ampla vivência de campo.',
    category: 'abrangencia'
  },
  {
    id: '4',
    question: 'Qual é a duração do programa de capacitação?',
    answer: 'A duração varia entre 4 meses, 6 meses ou 8 meses. O ciclo ideal é definido estrategicamente conforme o contexto, o porte da equipe e os objetivos comerciais específicos da sua empresa.',
    category: 'duracao'
  },
  {
    id: '6',
    question: 'É possível personalizar o treinamento para a nossa linha de produtos e insumos?',
    answer: 'Com certeza! Realizamos um diagnóstico prévio com a sua gestão para customizar cases reais, cenários de objeção do produtor e simulações focadas na sua linha de produtos ou soluções agrícolas.',
    category: 'personalizacao'
  }
];
