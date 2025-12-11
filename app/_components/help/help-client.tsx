"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import {
  HelpCircle,
  Search,
  BookOpen,
  CreditCard,
  Shield,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Geral",
    question: "Como adicionar uma transação?",
    answer:
      'Clique no botão "+ Adicionar Transação" no menu superior ou na página de Transações. Preencha os campos obrigatórios (nome, valor, tipo, categoria, método de pagamento e data) e clique em "Criar".',
  },
  {
    id: "2",
    category: "Geral",
    question: "Posso editar ou deletar uma transação?",
    answer:
      'Sim! Na página de Transações, clique no botão "..." na linha da transação desejada e escolha "Editar" ou "Deletar".',
  },
  {
    id: "3",
    category: "Transações",
    question: "Como funcionam as parcelas?",
    answer:
      'Ao criar uma despesa, marque a opção "Parcelar compra". Escolha o número de parcelas (2-24) e a data de término. O sistema criará automaticamente todas as parcelas distribuídas mensalmente.',
  },
  {
    id: "4",
    category: "Transações",
    question: "Quais são os tipos de transação?",
    answer:
      "Existem 3 tipos: Receita (dinheiro que entra), Despesa (dinheiro que sai) e Investimento (aplicações financeiras).",
  },
  {
    id: "5",
    category: "Assinaturas",
    question: "Como gerenciar assinaturas?",
    answer:
      'Acesse a página "Assinatura" no menu. Você pode adicionar, editar ou remover assinaturas recorrentes como Netflix, Spotify, etc. O sistema detecta automaticamente os logos dos serviços mais populares.',
  },
  {
    id: "6",
    category: "Assinaturas",
    question: "Vou receber alertas de assinaturas vencendo?",
    answer:
      "Sim! O sistema verifica diariamente assinaturas que vencem em até 7 dias e cria notificações automáticas. Você pode configurar isso em Configurações > Notificações.",
  },
  {
    id: "7",
    category: "IA",
    question: "Como usar o Assistente de IA?",
    answer:
      'Clique no botão flutuante com ícone de robô no canto inferior direito. Você pode fazer perguntas sobre seus gastos, pedir resumos financeiros ou gerar insights automáticos clicando em "Gerar Insights".',
  },
  {
    id: "8",
    category: "IA",
    question: "Preciso configurar alguma API para usar a IA?",
    answer:
      "Não! A IA funciona com fallback local baseado em regras. Porém, se quiser respostas mais avançadas, você pode configurar a chave da Hugging Face nas Configurações do sistema.",
  },
  {
    id: "9",
    category: "Segurança",
    question: "Meus dados estão seguros?",
    answer:
      "Sim! Todas as senhas são criptografadas com bcrypt. A autenticação usa NextAuth v5 com JWT. Seus dados financeiros ficam no seu banco de dados e não são compartilhados com terceiros.",
  },
  {
    id: "10",
    category: "Segurança",
    question: "Como alterar minha senha?",
    answer:
      'Vá em Configurações > Segurança. Digite sua senha atual, a nova senha e confirme. Clique em "Alterar Senha".',
  },
  {
    id: "11",
    category: "Configurações",
    question: "Como mudar o dia de fechamento?",
    answer:
      'Em Configurações > Financeiro, altere o campo "Dia de Fechamento". Este dia é usado para calcular previsões e fechamento de faturas no Dashboard.',
  },
  {
    id: "12",
    category: "Dashboard",
    question: "O que é a Previsão de Gastos?",
    answer:
      "É um card que mostra o total de despesas previstas até o dia de fechamento configurado. Ele calcula automaticamente se você terá saldo suficiente e exibe alertas visuais.",
  },
  {
    id: "13",
    category: "Análises",
    question: "Como ver análises detalhadas?",
    answer:
      'Acesse a página "Análises" no menu lateral. Você verá gráficos de categorias, métodos de pagamento, tendências mensais e maiores despesas.',
  },
  {
    id: "14",
    category: "Geral",
    question: "Posso usar no celular?",
    answer:
      "Sim! A aplicação é totalmente responsiva e funciona em smartphones, tablets e desktops. A interface se adapta automaticamente ao tamanho da tela.",
  },
  {
    id: "15",
    category: "Troubleshooting",
    question: "Erro ao adicionar transação",
    answer:
      "Se aparecer erro de Foreign Key, faça logout e login novamente. Isso atualiza sua sessão com o ID correto do banco de dados. Certifique-se também de que todos os campos estão preenchidos.",
  },
];

const categories = [
  "Todas",
  "Geral",
  "Transações",
  "Assinaturas",
  "IA",
  "Segurança",
  "Configurações",
  "Dashboard",
  "Análises",
  "Troubleshooting",
];

export default function HelpClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="flex flex-col gap-2 text-2xl font-bold sm:flex-row sm:items-center sm:text-3xl">
          <HelpCircle className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Encontre respostas para suas dúvidas sobre o Finance AI
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <Input
          placeholder="Buscar por palavra-chave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-xs sm:text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary cursor-pointer transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <BookOpen className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Primeiros Passos</CardTitle>
                <CardDescription className="text-xs">
                  Como começar a usar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <CreditCard className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Transações</CardTitle>
                <CardDescription className="text-xs">
                  Gerenciar gastos e receitas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <Sparkles className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Assistente IA</CardTitle>
                <CardDescription className="text-xs">
                  Dicas de uso da IA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Perguntas Frequentes</h2>

        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma pergunta encontrada para "{searchTerm}"
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <Card
                key={faq.id}
                className="hover:border-primary cursor-pointer transition-all"
                onClick={() => toggleExpand(faq.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {faq.category}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {faq.question}
                      </CardTitle>
                    </div>
                    {expandedId === faq.id ? (
                      <ChevronUp className="text-muted-foreground h-5 w-5 shrink-0" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-5 w-5 shrink-0" />
                    )}
                  </div>
                </CardHeader>

                {expandedId === faq.id && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {faq.answer}
                    </p>
                    {faq.id === "8" && (
                      <Button
                        onClick={() => router.push("/settings?tab=ai")}
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Settings className="h-4 w-4" />
                        Ir para Configurações de IA
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assistente IA */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-bold">Assistente IA</CardTitle>
          </div>
          <CardDescription>
            Faça perguntas sobre finanças e receba respostas inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAssistant />
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Ainda precisa de ajuda?</CardTitle>
          <CardDescription>
            Não encontrou o que procurava? Entre em contato conosco!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="default" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Documentação Completa
          </Button>
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Reportar Problema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente: Assistente IA
function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const exampleQuestions = [
    "Como posso economizar mais dinheiro?",
    "Qual a melhor forma de investir?",
    "Como criar uma reserva de emergência?",
    "Devo pagar minhas dívidas ou investir primeiro?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer("");

    try {
      // Simular resposta da IA (você pode integrar com uma API real depois)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Respostas baseadas em regras (fallback)
      const lowerQuestion = question.toLowerCase();
      let response = "";

      if (lowerQuestion.includes("economizar") || lowerQuestion.includes("economia")) {
        response = `Para economizar mais dinheiro, recomendo:

1. **Crie um orçamento**: Use a regra 50/30/20 (50% necessidades, 30% desejos, 20% poupança)
2. **Reduza gastos desnecessários**: Revise assinaturas e cancelar o que não usa
3. **Pague à vista**: Evite juros de cartão de crédito
4. **Automatize poupança**: Configure transferências automáticas
5. **Acompanhe gastos**: Use o dashboard para identificar onde está gastando mais

Lembre-se: pequenas economias diárias se transformam em grandes resultados ao longo do tempo!`;
      } else if (lowerQuestion.includes("investir") || lowerQuestion.includes("investimento")) {
        response = `Para começar a investir:

1. **Primeiro**: Construa uma reserva de emergência (6 meses de despesas)
2. **Comece simples**: Tesouro Selic ou CDB com liquidez diária
3. **Diversifique**: Não coloque tudo em um único investimento
4. **Invista regularmente**: Mesmo valores pequenos fazem diferença com juros compostos
5. **Pense no longo prazo**: Investimentos de risco precisam de tempo

**Dica**: Use a calculadora de juros compostos na página de Economia para ver o poder do tempo!`;
      } else if (lowerQuestion.includes("reserva") || lowerQuestion.includes("emergência")) {
        response = `Para criar uma reserva de emergência:

1. **Defina a meta**: 6 meses de suas despesas essenciais
2. **Calcule**: Some aluguel, alimentação, transporte, contas básicas
3. **Comece pequeno**: Guarde o que conseguir, mesmo que seja R$ 50/mês
4. **Onde guardar**: Conta poupança ou CDB com liquidez diária
5. **Não use**: Apenas para emergências reais (desemprego, saúde, reparos urgentes)

**Exemplo**: Se suas despesas são R$ 3.000/mês, sua reserva deve ser R$ 18.000.`;
      } else if (lowerQuestion.includes("dívida") || lowerQuestion.includes("dívidas")) {
        response = `A ordem correta geralmente é:

1. **Primeiro**: Pague dívidas com juros altos (cartão de crédito, cheque especial)
2. **Depois**: Construa reserva de emergência básica (3 meses)
3. **Então**: Continue pagando outras dívidas enquanto investe
4. **Paralelo**: Invista pequenos valores mesmo enquanto paga dívidas

**Regra de ouro**: Se os juros da dívida são maiores que o retorno do investimento, pague a dívida primeiro!

Use a calculadora de parcelas na página de Economia para comparar opções.`;
      } else {
        response = `Entendo sua pergunta sobre "${question}". 

Para uma resposta mais específica, recomendo:
- Explorar a seção de Educação Financeira na página de Economia
- Verificar as Perguntas Frequentes acima
- Usar as calculadoras disponíveis para simular cenários

Se precisar de ajuda específica sobre funcionalidades do sistema, consulte a documentação ou entre em contato com o suporte.`;
      }

      setAnswer(response);
    } catch (error) {
      setAnswer("Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta sobre finanças..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? "Pensando..." : "Perguntar"}
          </Button>
        </div>
      </form>

      {answer && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed whitespace-pre-line">{answer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-muted-foreground mb-2 text-sm font-medium">Perguntas de exemplo:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((q, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setQuestion(q)}
              className="text-xs"
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

