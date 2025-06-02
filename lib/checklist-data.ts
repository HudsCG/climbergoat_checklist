export interface ChecklistItem {
  id: string
  question: string
  tip?: string
}

export interface ChecklistCategory {
  id: string
  title: string
  shortTitle?: string
  description: string
  items: ChecklistItem[]
}

export interface MaturityLevel {
  id: string
  name: string
  minScore: number
  maxScore: number
  description: string
}

export const maturityLevels: MaturityLevel[] = [
  {
    id: "beginner",
    name: "Iniciante",
    minScore: 0,
    maxScore: 30,
    description: "Seu perfil precisa de atenção imediata para começar a atrair turistas.",
  },
  {
    id: "regular",
    name: "Regular",
    minScore: 31,
    maxScore: 60,
    description: "Seu perfil está no caminho certo, mas há várias oportunidades de melhoria.",
  },
  {
    id: "good",
    name: "Bom",
    minScore: 61,
    maxScore: 85,
    description: "Seu perfil está bem estruturado, com apenas alguns ajustes necessários.",
  },
  {
    id: "gold",
    name: "Perfil Ouro",
    minScore: 86,
    maxScore: 100,
    description: "Parabéns! Seu perfil está otimizado para atrair turistas.",
  },
]

// Atualizar o checklistData com as informações mais relevantes fornecidas

export const checklistData: ChecklistCategory[] = [
  {
    id: "informacoes-basicas",
    title: "Informações Básicas Essenciais",
    shortTitle: "Informações",
    description:
      "Verifique se as informações básicas do seu negócio estão completas e corretas para que turistas encontrem você facilmente.",
    items: [
      {
        id: "nome-empresa",
        question: "O nome da empresa está exatamente igual ao nome que seus clientes conhecem?",
        tip: "Use o nome oficial do seu estabelecimento, sem abreviações ou palavras-chave extras.",
      },
      {
        id: "categoria-principal",
        question:
          "A categoria principal descreve corretamente seu negócio? (Ex: Pousada, Restaurante Baiano, Loja de Artesanato)",
        tip: "A categoria principal deve representar com precisão seu negócio principal para aparecer nas buscas certas.",
      },
      {
        id: "categorias-adicionais",
        question: "Você adicionou outras categorias relevantes? (Ex: Hotel, Bar, Restaurante com vista para o mar)",
        tip: "Adicione até 9 categorias secundárias que descrevam outros serviços que você oferece.",
      },
      {
        id: "endereco-localizacao",
        question: "O endereço está completo e o marcador no mapa aponta EXATAMENTE para sua entrada?",
        tip: "Isso é crucial para o GPS do turista não levá-lo para o lugar errado! Teste o GPS você mesmo.",
      },
      {
        id: "area-cobertura",
        question: "Se você atende em domicílio (delivery, passeios), definiu a área de cobertura corretamente?",
        tip: "Configure a área de atendimento para delivery ou serviços externos que você oferece.",
      },
      {
        id: "telefone-whatsapp",
        question: "O número principal (preferencialmente WhatsApp Business) está correto e funcionando?",
        tip: "O WhatsApp Business facilita muito a comunicação com turistas, especialmente internacionais.",
      },
      {
        id: "website-link",
        question: "O link para seu site (ou perfil de reservas/rede social principal) está funcionando?",
        tip: "Verifique se o link direciona para uma página atualizada e responsiva.",
      },
    ],
  },
  {
    id: "horarios",
    title: "Horários de Funcionamento",
    shortTitle: "Horários",
    description: "Mantenha seus horários sempre atualizados para evitar frustrações dos turistas.",
    items: [
      {
        id: "horario-normal",
        question: "O horário normal está cadastrado corretamente para todos os dias da semana?",
        tip: "Verifique se os horários estão corretos para cada dia, incluindo fins de semana.",
      },
      {
        id: "horarios-especiais",
        question:
          "Você atualiza em feriados, férias coletivas ou eventos especiais? (Ex: São João, Réveillon, baixa temporada)",
        tip: "Mantenha sempre atualizado, especialmente em períodos de alta temporada e feriados locais.",
      },
    ],
  },
  {
    id: "fotos-videos",
    title: "Fotos e Vídeos que Encantam",
    shortTitle: "Fotos",
    description: "Use fotos e vídeos de alta qualidade para mostrar o melhor do seu negócio e atrair turistas.",
    items: [
      {
        id: "foto-capa-atraente",
        question: "Sua foto de capa é atraente e representa bem seu negócio?",
        tip: "A foto de capa é a primeira impressão. Use uma imagem de alta resolução que represente bem seu negócio.",
      },
      {
        id: "logotipo-qualidade",
        question: "Seu logotipo está adicionado e com boa qualidade?",
        tip: "O logo deve ser claro, legível e representar sua marca adequadamente.",
      },
      {
        id: "fotos-fachada-entrada",
        question: "Você tem fotos de alta qualidade da fachada/entrada?",
        tip: "Mostre como é fácil identificar e encontrar seu estabelecimento.",
      },
      {
        id: "fotos-ambientes-internos",
        question: "Tem fotos dos ambientes internos (quartos, restaurante, loja)?",
        tip: "Mostre os espaços internos para que os clientes saibam o que esperar.",
      },
      {
        id: "fotos-produtos-pratos",
        question: "Adicionou fotos dos produtos/pratos principais?",
        tip: "Para restaurantes, inclua fotos dos pratos; para pousadas, dos quartos e áreas comuns.",
      },
      {
        id: "fotos-diferenciais",
        question: "Tem fotos dos detalhes que mostram seu diferencial (decoração, vista)?",
        tip: "Destaque o que torna seu negócio único e especial.",
      },
      {
        id: "videos-curtos",
        question: "Adicionou vídeos curtos mostrando o ambiente ou a experiência?",
        tip: "Vídeos aumentam o engajamento e mostram melhor a atmosfera do seu estabelecimento.",
      },
      {
        id: "atualizacao-fotos",
        question: "Você adiciona novas fotos regularmente (pelo menos a cada 2-3 meses)?",
        tip: "Fotos atualizadas mostram que seu negócio está ativo e em constante melhoria.",
      },
    ],
  },
  {
    id: "servicos-comodidades",
    title: "Serviços e Comodidades",
    shortTitle: "Serviços",
    description: "Liste todos os serviços e comodidades que oferece - isso é crucial para o turismo!",
    items: [
      {
        id: "servicos-listados",
        question:
          "Cadastrou todos os serviços que oferece com descrições? (Ex: Café da manhã incluso, Passeio de barco, Aluguel de bicicleta)",
        tip: "Liste todos os serviços extras que oferece para se destacar da concorrência.",
      },
      {
        id: "comodidades-hotel",
        question:
          "Marcou todas as comodidades? (Ex: Wi-Fi gratuito, Ar condicionado, Piscina, Aceita pets, Estacionamento)",
        tip: "Marque todas as comodidades disponíveis, especialmente as que turistas mais procuram.",
      },
      {
        id: "cardapio-restaurante",
        question: "Adicionou o link para o cardápio ou fotos dele? (Para restaurantes)",
        tip: "Cardápios com fotos e preços ajudam os clientes a decidirem antes mesmo de visitar.",
      },
      {
        id: "atributos-relevantes",
        question: "Marcou todos os atributos relevantes? (Ex: Acessibilidade, LGBTQ+ friendly, Formas de pagamento)",
        tip: "Atributos ajudam turistas a encontrar exatamente o que procuram.",
      },
    ],
  },
  {
    id: "descricao",
    title: "Descrição Atraente",
    shortTitle: "Descrição",
    description: "Sua descrição deve contar a história do seu negócio e destacar seus diferenciais.",
    items: [
      {
        id: "texto-persuasivo",
        question:
          "Sua descrição conta a história do negócio e usa palavras que turistas buscam? (Ex: 'pousada pé na areia em Cumuruxatiba')",
        tip: "Use termos que turistas pesquisam: 'pé na areia', 'vista para o mar', 'centro histórico', 'artesanato local'.",
      },
      {
        id: "diferenciais-destacados",
        question: "Destacou seus principais diferenciais na descrição?",
        tip: "Mencione o que torna seu negócio único: localização, especialidades, história, etc.",
      },
      {
        id: "clareza-leitura",
        question: "A descrição é fácil de ler e entender o que você oferece?",
        tip: "Use linguagem clara e direta, evite textos muito longos ou confusos.",
      },
    ],
  },
  {
    id: "avaliacoes",
    title: "Avaliações e Reputação",
    shortTitle: "Avaliações",
    description: "Gerencie sua reputação online de forma profissional e proativa.",
    items: [
      {
        id: "monitoramento-avaliacoes",
        question: "Você acompanha as novas avaliações recebidas regularmente?",
        tip: "Configure notificações para saber imediatamente quando receber uma nova avaliação.",
      },
      {
        id: "responde-todas-avaliacoes",
        question: "Você responde a TODAS as avaliações (positivas e negativas) de forma profissional e rápida?",
        tip: "Responder rapidamente mostra que você valoriza o feedback dos clientes.",
      },
      {
        id: "incentiva-avaliacoes",
        question: "Você incentiva seus clientes satisfeitos a deixarem uma avaliação?",
        tip: "Pode ser um lembrete verbal, um pequeno cartaz ou um link no WhatsApp.",
      },
      {
        id: "nota-media-alta",
        question: "Sua nota média está acima de 4,0 estrelas?",
        tip: "Trabalhe para manter sua avaliação média acima de 4,0 para transmitir confiança.",
      },
      {
        id: "volume-avaliacoes-recentes",
        question: "Você tem mais de 10 avaliações nos últimos 3 meses?",
        tip: "Avaliações recentes mostram que seu negócio está ativo e mantém a qualidade.",
      },
      {
        id: "gerencia-avaliacoes-negativas",
        question: "Você gerencia adequadamente as avaliações negativas?",
        tip: "Responda com empatia, reconheça problemas e ofereça soluções ou compensações quando apropriado.",
      },
    ],
  },
  {
    id: "perguntas-respostas",
    title: "Perguntas e Respostas (P&R)",
    shortTitle: "P&R",
    description: "Antecipe as dúvidas dos turistas respondendo perguntas frequentes.",
    items: [
      {
        id: "monitora-perguntas",
        question: "Você verifica se há novas perguntas feitas por usuários?",
        tip: "Configure notificações para responder rapidamente às perguntas dos interessados.",
      },
      {
        id: "respostas-rapidas",
        question: "Responde às perguntas rapidamente (em até 24 horas)?",
        tip: "Respostas rápidas aumentam as chances de converter interessados em clientes.",
      },
      {
        id: "perguntas-proativas",
        question:
          "Você adicionou as perguntas mais frequentes? (Ex: 'Aceitam pets?', 'Qual horário do café da manhã?')",
        tip: "Antecipe as dúvidas mais comuns para facilitar a decisão dos clientes.",
      },
    ],
  },
  {
    id: "postagens",
    title: "Postagens: Mantenha seu Perfil Vivo!",
    shortTitle: "Posts",
    description: "Mantenha seu perfil ativo com postagens regulares e relevantes.",
    items: [
      {
        id: "frequencia-postagens",
        question: "Você faz postagens no GMB regularmente (pelo menos 1-2 vezes por semana)?",
        tip: "Mantenha uma frequência regular de posts para mostrar que seu negócio está ativo.",
      },
      {
        id: "tipos-posts-variados",
        question: "Usa os diferentes formatos de post? (Ofertas, Novidades, Eventos)",
        tip: "Varie entre ofertas especiais, novidades do negócio e eventos locais.",
      },
      {
        id: "conteudo-relevante",
        question: "Posta fotos recentes, promoções, dicas locais, informações sobre eventos na cidade?",
        tip: "Compartilhe conteúdo que interesse aos turistas: dicas locais, eventos, promoções.",
      },
      {
        id: "botoes-acao",
        question: "Inclui botões como 'Reservar', 'Ligar agora', 'Saiba mais' nas postagens?",
        tip: "Botões de ação facilitam a conversão de interessados em clientes.",
      },
    ],
  },
  {
    id: "conhecimento-local",
    title: "Conhecimento Local",
    shortTitle: "Local",
    description: "Mostre que você conhece a região e pode ajudar os turistas.",
    items: [
      {
        id: "atracoes-proximas",
        question: "Você menciona atrações turísticas próximas na descrição ou em posts?",
        tip: "Destaque praias, parques ou pontos turísticos próximos ao seu estabelecimento.",
      },
      {
        id: "informacoes-locais",
        question: "Você compartilha informações úteis sobre Prado ou Cumuruxatiba?",
        tip: "Compartilhe dicas sobre clima, melhor época para visitar, eventos locais etc.",
      },
      {
        id: "dicas-transporte",
        question: "Você fornece dicas de como chegar ao seu estabelecimento?",
        tip: "Inclua informações sobre transporte público, táxi, estacionamento ou serviços de transfer.",
      },
    ],
  },
]

// Helper functions
export const getMaturityLevel = (score: number): MaturityLevel => {
  return maturityLevels.find((level) => score >= level.minScore && score <= level.maxScore) || maturityLevels[0]
}

export const getImprovementSuggestions = (
  answers: Record<string, boolean>,
  categories: ChecklistCategory[],
): string[] => {
  const suggestions: string[] = []

  // Find items that are not completed
  categories.forEach((category) => {
    const incompleteItems = category.items.filter((item) => !answers[item.id])

    if (incompleteItems.length > 0) {
      // Add category-specific suggestions
      switch (category.id) {
        case "informacoes-basicas":
          if (incompleteItems.length > 2) {
            suggestions.push(
              "Complete as informações básicas do seu perfil, especialmente nome, categoria e horários de funcionamento.",
            )
          }
          break

        case "fotos":
          if (incompleteItems.length > 0) {
            suggestions.push(
              "Adicione mais fotos de qualidade, incluindo fotos do exterior, interior e serviços oferecidos.",
            )
          }
          break

        case "avaliacoes":
          if (incompleteItems.some((item) => item.id === "responde-avaliacoes")) {
            suggestions.push(
              "Responda a todas as avaliações, tanto positivas quanto negativas, de forma rápida e profissional.",
            )
          }
          if (incompleteItems.some((item) => item.id === "solicita-avaliacoes")) {
            suggestions.push("Crie um processo para solicitar ativamente avaliações de clientes satisfeitos.")
          }
          break

        case "posts":
          if (incompleteItems.length > 2) {
            suggestions.push(
              "Mantenha seu perfil ativo com postagens regulares sobre seu negócio, promoções e eventos locais.",
            )
          }
          break

        case "mensagens":
          if (incompleteItems.some((item) => item.id === "tempo-resposta")) {
            suggestions.push("Melhore seu tempo de resposta às mensagens para converter mais interessados em clientes.")
          }
          break

        default:
          // Add a generic suggestion if multiple items are incomplete in a category
          if (incompleteItems.length > Math.floor(category.items.length / 2)) {
            suggestions.push(`Foque em melhorar a seção "${category.title}" do seu perfil para aumentar sua pontuação.`)
          }
      }
    }
  })

  // Add general suggestions based on overall score
  const totalScore = calculateTotalScore(answers, categories)

  if (totalScore < 30) {
    suggestions.unshift("Comece atualizando as informações básicas e adicionando fotos de qualidade ao seu perfil.")
  } else if (totalScore < 60) {
    suggestions.unshift("Foque em responder avaliações e manter postagens regulares para engajar seus clientes.")
  } else if (totalScore < 85) {
    suggestions.unshift(
      "Para chegar ao nível Ouro, aproveite recursos avançados como reservas online e produtos em destaque.",
    )
  }

  // Limit to max 5 suggestions
  return suggestions.slice(0, 5)
}

// Helper function to calculate total score
const calculateTotalScore = (answers: Record<string, boolean>, categories: ChecklistCategory[]): number => {
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)

  if (totalItems === 0) return 0

  const completedItems = Object.values(answers).filter((value) => value === true).length
  return Math.round((completedItems / totalItems) * 100)
}
