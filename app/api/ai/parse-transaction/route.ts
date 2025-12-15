import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { TransactionType, TransactionCategory, TransactionPaymentMethod } from "@/app/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      console.error("Prompt inválido:", prompt);
      return NextResponse.json(
        { success: false, error: "Prompt inválido" },
        { status: 400 }
      );
    }

    console.log("Processando prompt:", prompt);

    // Parse simples do prompt (pode ser melhorado com IA real)
    const parsed = parseTransactionPrompt(prompt);

    if (!parsed) {
      console.error("Não foi possível fazer parse do prompt:", prompt);
      return NextResponse.json(
        { success: false, error: "Não foi possível entender a transação. Seja mais específico. Exemplo: 'Comprei um notebook de R$ 3.500 parcelado em 12x'" },
        { status: 400 }
      );
    }

    console.log("Dados parseados:", parsed);

    // Se for assinatura, criar também uma Subscription
    if (parsed.isSubscription) {
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1); // Próximo mês
      
      await db.subscription.create({
        data: {
          name: parsed.name,
          amount: parsed.amount,
          dueDate: new Date(),
          nextDueDate: nextDueDate,
          recurring: true,
          active: true,
          userId: session.user.id,
        },
      });
      
      console.log("Assinatura criada:", parsed.name);
    }

    // Criar transação(ões)
    if (parsed.installments && parsed.installments > 1) {
      // Criar parcelas
      const installmentGroupId = uuidv4();
      const installmentAmount = parsed.amount / parsed.installments;
      const transactions = [];
      const startDate = new Date();

      for (let i = 0; i < parsed.installments; i++) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(startDate.getMonth() + i);

        transactions.push({
          name: `${parsed.name} (${i + 1}/${parsed.installments})`,
          amount: installmentAmount,
          type: parsed.type,
          category: parsed.category,
          paymentMethod: parsed.paymentMethod,
          date: installmentDate,
          userId: session.user.id,
          installments: parsed.installments,
          currentInstallment: i + 1,
          installmentGroupId,
        });
      }

      await db.transaction.createMany({
        data: transactions,
      });
    } else {
      // Criar transação única
      await db.transaction.create({
        data: {
          name: parsed.name,
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category,
          paymentMethod: parsed.paymentMethod,
          date: new Date(),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Transação adicionada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao processar transação com IA:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Função simples de parse (pode ser substituída por IA real)
function parseTransactionPrompt(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();

  // Primeiro, tentar converter números por extenso
  let amount = parseWrittenNumber(prompt);
  
  // Se não encontrou por extenso, tentar padrões numéricos
  if (!amount) {
    // Extrair valor - múltiplos padrões
    // IMPORTANTE: Não capturar números que fazem parte de "X mil e Y"
    let valueMatch = prompt.match(/r\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i);
    if (!valueMatch) {
      valueMatch = prompt.match(/r\$?\s*(\d+[.,]?\d*)/i);
    }
    if (!valueMatch) {
      // Tentar sem R$ - mas evitar capturar números que são parte de "mil e X"
      // Verificar se não é parte de um padrão "mil e"
      const tempMatch = prompt.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
      if (tempMatch) {
        const beforeMatch = prompt.substring(0, tempMatch.index || 0).toLowerCase();
        const afterMatch = prompt.substring((tempMatch.index || 0) + tempMatch[0].length).toLowerCase();
        // Se não está próximo de "mil e", pode usar
        if (!beforeMatch.includes("mil") && !afterMatch.match(/^\s*(?:e|mil)/)) {
          valueMatch = tempMatch;
        }
      }
    }
    if (!valueMatch) {
      // Último recurso: pegar qualquer número, mas evitar se está em contexto de "mil"
      const tempMatch = prompt.match(/(\d+[.,]?\d*)/);
      if (tempMatch) {
        const beforeMatch = prompt.substring(0, tempMatch.index || 0).toLowerCase();
        const afterMatch = prompt.substring((tempMatch.index || 0) + tempMatch[0].length).toLowerCase();
        // Se não está próximo de "mil e", pode usar
        if (!beforeMatch.includes("mil") && !afterMatch.match(/^\s*(?:e|mil)/)) {
          valueMatch = tempMatch;
        }
      }
    }
    
    if (!valueMatch) return null;

    const amountStr = valueMatch[1].replace(/\./g, "").replace(",", ".");
    amount = parseFloat(amountStr);
    console.log(`Valor numérico detectado: ${amountStr} = ${amount}`);
  }
  
  if (isNaN(amount) || amount <= 0) return null;

  // Detectar tipo - melhorar detecção de receitas
  let type = TransactionType.EXPENSE;
  
  // Palavras-chave para receitas (DEPOSIT)
  const incomeKeywords = [
    "recebi", "ganhei", "ganhou", "entrou", "salário", "salario", "pagamento",
    "renda", "provento", "depósito", "deposito", "transferência recebida",
    "transferencia recebida", "dinheiro entrou", "dinheiro recebido",
    "pagou", "pagou para mim", "me pagou", "me deu", "deu para mim",
    "vendi", "venda", "receita", "lucro", "bonus", "bônus", "comissão",
    "comissao", "freelance", "freela", "trabalho", "emprego", "clt",
    "13º", "décimo terceiro", "férias", "ferias", "adiantamento",
    "adiantamento salarial", "vale", "reembolso", "estorno"
  ];
  
  // Palavras-chave para investimentos
  const investmentKeywords = [
    "investi", "investimento", "aplicação", "aplicacao", "aplicar",
    "tesouro", "cdb", "lci", "lca", "fundo", "ações", "acoes", "ações",
    "renda fixa", "renda variável", "poupança", "poupanca"
  ];
  
  // Verificar se é receita
  const isIncome = incomeKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Verificar se é investimento
  const isInvestment = investmentKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  if (isIncome) {
    type = TransactionType.DEPOSIT;
    console.log("Tipo detectado: RECEITA (DEPOSIT)");
  } else if (isInvestment) {
    type = TransactionType.INVESTMENT;
    console.log("Tipo detectado: INVESTIMENTO");
  } else {
    type = TransactionType.EXPENSE;
    console.log("Tipo detectado: DESPESA (EXPENSE)");
  }

  // Detectar categoria
  let category = TransactionCategory.OTHER;
  let isSubscription = false;
  
  // Detectar assinaturas primeiro (Netflix, Spotify, etc.)
  const subscriptionKeywords = [
    "assinatura", "subscription", "netflix", "spotify", "amazon prime", "prime video",
    "disney+", "disney plus", "hbo", "hbo max", "youtube premium", "apple music",
    "deezer", "tidal", "paramount+", "star+", "globoplay", "crunchyroll",
    "microsoft 365", "office 365", "adobe", "photoshop", "premiere", "canva",
    "notion", "figma", "slack", "zoom", "dropbox", "icloud", "google drive",
    "github", "gitlab", "aws", "azure", "cloudflare", "domínio", "hosting",
    "iugu", "asaas", "pagseguro", "stripe", "mercadopago", "recorrente",
    "mensal", "anual", "plano", "premium", "pro", "plus"
  ];
  
  isSubscription = subscriptionKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  if (isSubscription) {
    category = TransactionCategory.ENTERTAINMENT; // Assinaturas geralmente são entretenimento
  } else if (lowerPrompt.includes("supermercado") || lowerPrompt.includes("comida") || lowerPrompt.includes("almoço") || lowerPrompt.includes("jantar")) {
    category = TransactionCategory.FOOD;
  } else if (lowerPrompt.includes("uber") || lowerPrompt.includes("taxi") || lowerPrompt.includes("ônibus") || lowerPrompt.includes("transporte")) {
    category = TransactionCategory.TRANSPORTATION;
  } else if (lowerPrompt.includes("notebook") || lowerPrompt.includes("computador") || lowerPrompt.includes("celular") || lowerPrompt.includes("eletrônico")) {
    category = TransactionCategory.OTHER;
  } else if (lowerPrompt.includes("aluguel") || lowerPrompt.includes("casa") || lowerPrompt.includes("moradia")) {
    category = TransactionCategory.HOUSING;
  } else if (lowerPrompt.includes("médico") || lowerPrompt.includes("farmácia") || lowerPrompt.includes("saúde")) {
    category = TransactionCategory.HEALTH;
  } else if (lowerPrompt.includes("cinema") || lowerPrompt.includes("show") || lowerPrompt.includes("entretenimento")) {
    category = TransactionCategory.ENTERTAINMENT;
  } else if (lowerPrompt.includes("curso") || lowerPrompt.includes("faculdade") || lowerPrompt.includes("educação")) {
    category = TransactionCategory.EDUCATION;
  } else if (lowerPrompt.includes("luz") || lowerPrompt.includes("água") || lowerPrompt.includes("internet") || lowerPrompt.includes("conta")) {
    category = TransactionCategory.UTILITY;
  } else if (lowerPrompt.includes("salário")) {
    category = TransactionCategory.SALARY;
  }

  // Detectar método de pagamento
  let paymentMethod = TransactionPaymentMethod.OTHER;
  if (lowerPrompt.includes("cartão de crédito") || lowerPrompt.includes("crédito")) {
    paymentMethod = TransactionPaymentMethod.CREDIT_CARD;
  } else if (lowerPrompt.includes("cartão de débito") || lowerPrompt.includes("débito")) {
    paymentMethod = TransactionPaymentMethod.DEBIT_CARD;
  } else if (lowerPrompt.includes("pix")) {
    paymentMethod = TransactionPaymentMethod.PIX;
  } else if (lowerPrompt.includes("dinheiro") || lowerPrompt.includes("cash")) {
    paymentMethod = TransactionPaymentMethod.CASH;
  } else if (lowerPrompt.includes("boleto")) {
    paymentMethod = TransactionPaymentMethod.BANK_SLIP;
  } else if (lowerPrompt.includes("transferência")) {
    paymentMethod = TransactionPaymentMethod.BANK_TRANSFER;
  }

  // Detectar parcelas
  let installments: number | undefined;
  const installmentMatch = prompt.match(/(\d+)x/i);
  if (installmentMatch) {
    installments = parseInt(installmentMatch[1]);
  }

  // Extrair nome - remover valores monetários e outras informações
  let name = prompt
    .replace(/r\$?\s*\d+[.,]?\d*/gi, "")
    .replace(/\d+\s*mil\s*(?:e\s*)?\d+/gi, "") // Remove "3 mil e 200"
    .replace(/\d+\s*mil/gi, "") // Remove "3 mil"
    .replace(/mil\s*(?:e\s*)?\d+/gi, "") // Remove "mil e 200"
    .replace(/\d+x/gi, "")
    .replace(/(no |na |com |pelo |pela |a |de |em )/gi, "")
    .replace(/(cartão de crédito|crédito|débito|pix|dinheiro|boleto|transferência)/gi, "")
    .replace(/(comprei|paguei|gastei|recebi|adquiri)/gi, "")
    .replace(/\s+/g, " ") // Remove espaços múltiplos
    .trim();

  // Se for assinatura e o nome não ficou bom, tentar extrair melhor
  if (isSubscription) {
    // Tentar encontrar o nome do serviço nas palavras-chave de assinatura
    const subscriptionServices = [
      "netflix", "spotify", "amazon prime", "prime video", "disney+", "disney plus",
      "hbo", "hbo max", "youtube premium", "apple music", "deezer", "tidal",
      "paramount+", "star+", "globoplay", "crunchyroll", "microsoft 365", "office 365",
      "adobe", "photoshop", "premiere", "canva", "notion", "figma", "slack", "zoom",
      "dropbox", "icloud", "google drive", "github", "gitlab"
    ];
    
    for (const service of subscriptionServices) {
      if (lowerPrompt.includes(service)) {
        // Capitalizar primeira letra de cada palavra
        name = service.split(" ").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
        break;
      }
    }
    
    // Se ainda não encontrou, usar "Assinatura" + primeira palavra relevante
    if (!name || name.length < 2) {
      const words = prompt.split(/\s+/).filter(w => 
        w.length > 2 && 
        !w.match(/^\d+$/) && 
        !w.match(/r\$/i) &&
        !["de", "da", "do", "em", "no", "na", "com", "pelo", "pela", "a"].includes(w.toLowerCase())
      );
      if (words.length > 0) {
        name = `Assinatura ${words[0].charAt(0).toUpperCase() + words[0].slice(1)}`;
      } else {
        name = "Assinatura";
      }
    } else if (!name.toLowerCase().includes("assinatura") && !name.toLowerCase().includes("subscription")) {
      name = `Assinatura ${name}`;
    }
  } else {
    if (!name || name.length < 2) {
      name = type === TransactionType.DEPOSIT ? "Receita" : "Despesa";
    }
  }

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount,
    type,
    category,
    paymentMethod,
    installments,
    isSubscription,
  };
}

// Função para converter números por extenso em valores numéricos
function parseWrittenNumber(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  // Padrões para números por extenso
  // Exemplos: "3 mil e 200", "mil e quinhentos", "dois mil", "500 reais"
  
  // Mapeamento de números por extenso
  const numberMap: Record<string, number> = {
    "zero": 0, "um": 1, "dois": 2, "três": 3, "quatro": 4, "cinco": 5,
    "seis": 6, "sete": 7, "oito": 8, "nove": 9, "dez": 10,
    "onze": 11, "doze": 12, "treze": 13, "quatorze": 14, "quinze": 15,
    "dezesseis": 16, "dezessete": 17, "dezoito": 18, "dezenove": 19,
    "vinte": 20, "trinta": 30, "quarenta": 40, "cinquenta": 50,
    "sessenta": 60, "setenta": 70, "oitenta": 80, "noventa": 90,
    "cem": 100, "cento": 100, "duzentos": 200, "trezentos": 300,
    "quatrocentos": 400, "quinhentos": 500, "seiscentos": 600,
    "setecentos": 700, "oitocentos": 800, "novecentos": 900,
    "mil": 1000, "milhão": 1000000, "milhões": 1000000,
  };

  // Padrão 1: "X mil e Y" ou "X mil Y" (ex: "3 mil e 200", "2 mil 500", "a 3 mil e 200")
  // Melhorar regex para capturar mesmo com palavras antes/depois
  // Procura por qualquer número seguido de "mil" e depois outro número
  const milPattern1 = lowerText.match(/(\d+)\s*mil\s*(?:e\s*)?(\d+)/);
  if (milPattern1) {
    const milhares = parseInt(milPattern1[1]) * 1000;
    const unidades = parseInt(milPattern1[2]);
    const total = milhares + unidades;
    console.log(`Padrão "X mil e Y" detectado: ${milPattern1[1]} mil e ${milPattern1[2]} = ${total}`);
    return total;
  }

  // Padrão 2: "X mil" (ex: "3 mil", "5 mil")
  const milPattern2 = lowerText.match(/(\d+)\s*mil/);
  if (milPattern2) {
    return parseInt(milPattern2[1]) * 1000;
  }

  // Padrão 3: "mil e X" ou "mil X" (ex: "mil e duzentos", "mil 500")
  const milPattern3 = lowerText.match(/mil\s*(?:e\s*)?(\d+)/);
  if (milPattern3) {
    return 1000 + parseInt(milPattern3[1]);
  }

  // Padrão 4: Números por extenso simples (ex: "quinhentos", "trezentos")
  for (const [word, value] of Object.entries(numberMap)) {
    if (lowerText.includes(word) && value >= 100) {
      // Verificar se é "mil e X" ou "X mil"
      if (word === "mil") {
        const afterMil = lowerText.match(/mil\s*(?:e\s*)?(\w+)/);
        if (afterMil) {
          const afterValue = numberMap[afterMil[1]] || 0;
          return 1000 + afterValue;
        }
        return 1000;
      }
      return value;
    }
  }

  // Padrão 5: "X reais" ou "R$ X" já tratado acima, mas vamos melhorar
  const reaisPattern = lowerText.match(/(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:reais|r\$)/);
  if (reaisPattern) {
    const amountStr = reaisPattern[1].replace(/\./g, "").replace(",", ".");
    return parseFloat(amountStr);
  }

  return null;
}



