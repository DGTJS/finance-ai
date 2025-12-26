"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaRobot,
  FaShieldAlt,
  FaMobileAlt,
  FaBullseye,
  FaCreditCard,
  FaArrowRight,
  FaCheck,
  FaMagic,
  FaRocket,
  FaStar,
} from "react-icons/fa";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    // Efeito de parallax com mouse
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: FaChartLine,
      title: "Análise Inteligente",
      description:
        "Insights automáticos sobre seus gastos e receitas com IA avançada",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaRobot,
      title: "Assistente de IA",
      description:
        "Crie transações e receba recomendações personalizadas em segundos",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaShieldAlt,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta a ponta",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FaMobileAlt,
      title: "Multiplataforma",
      description: "Acesse de qualquer dispositivo, a qualquer momento",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FaBullseye,
      title: "Metas Financeiras",
      description: "Defina e acompanhe suas metas com visualizações claras",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: FaCreditCard,
      title: "Controle Total",
      description:
        "Gerencie transações, assinaturas e orçamentos em um só lugar",
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const benefits = [
    "Gestão completa de receitas e despesas",
    "Insights personalizados com IA",
    "Controle de assinaturas e pagamentos recorrentes",
    "Metas financeiras com acompanhamento visual",
    "Dashboard freelancer para profissionais autônomos",
    "Relatórios e análises detalhadas",
  ];

  const stats = [
    { value: "10K+", label: "Usuários Ativos" },
    { value: "R$ 50M+", label: "Gerenciados" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "Avaliação" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  // Se estiver autenticado, o middleware já redireciona para /dashboard
  // Não precisamos fazer nada aqui

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      {/* Partículas de fundo animadas */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>

      {/* Grid pattern animado */}
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-20" />

      {/* Header/Navbar com glassmorphism */}
      <header className="glass-card fixed top-0 right-0 left-0 z-50 border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/logo.png"
              width={120}
              height={27}
              alt="Finance AI"
              className="h-8 w-auto transition-transform group-hover:scale-110"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="hover-lift-3d hidden sm:flex"
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="button-glow hover-lift-3d gap-2"
            >
              Começar Agora
              <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section com efeitos visuais */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Gradiente animado de fundo */}
        <div className="animated-gradient absolute inset-0 opacity-10" />

        {/* Círculos decorativos */}
        <div
          className="bg-primary/20 parallax-element absolute top-20 left-10 h-72 w-72 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div
          className="parallax-element absolute right-10 bottom-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge animado */}
            <div className="fade-in-up bg-card/50 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm">
              <FaMagic className="text-primary icon-spin-slow h-4 w-4" />
              <span className="text-gradient-animated font-semibold">
                Powered by AI
              </span>
              <FaStar className="h-3 w-3 text-yellow-500" />
            </div>

            <h1 className="fade-in-up-delay-1 mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Controle suas Finanças com{" "}
              <span className="text-gradient-animated relative inline-block">
                Inteligência Artificial
                <span className="bg-primary/20 absolute right-0 -bottom-2 left-0 h-3 blur-xl" />
              </span>
            </h1>

            <p className="fade-in-up-delay-2 text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
              A plataforma completa de gestão financeira que usa IA para te
              ajudar a tomar decisões mais inteligentes sobre seu dinheiro.
            </p>

            {/* Stats */}
            <div className="fade-in-up-delay-3 mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card hover-lift-3d rounded-xl p-4"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="text-primary text-2xl font-bold sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="fade-in-up-delay-4 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => router.push("/login")}
                className="button-glow hover-lift-3d group gap-2 px-8 py-6 text-lg"
              >
                <FaRocket className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Começar Grátis
                <FaArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover-lift-3d glass-card px-8 py-6 text-lg"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="fade-in-up-delay-5 absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-xs">
              Role para explorar
            </span>
            <div className="bg-primary/30 h-8 w-0.5 animate-bounce rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section com animações */}
      <section id="features" className="relative overflow-hidden py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Tudo que você precisa para{" "}
              <span className="text-gradient-animated">
                controlar suas finanças
              </span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl">
              Funcionalidades poderosas projetadas para simplificar sua vida
              financeira
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group card-3d glass-card hover-lift-3d fade-in-up rounded-2xl p-8"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="from-primary mt-4 h-1 w-0 bg-gradient-to-r to-transparent transition-all group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section com visual impactante */}
      <section className="relative overflow-hidden py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-purple-500/5 to-cyan-500/5" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div className="fade-in-up">
              <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Por que escolher a{" "}
                <span className="text-gradient-animated">Finance AI?</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed sm:text-xl">
                Uma solução completa que combina tecnologia avançada com
                simplicidade para transformar a forma como você gerencia seu
                dinheiro.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="fade-in-up glass-card hover-lift-3d flex items-start gap-4 rounded-xl p-4"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="from-primary mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-green-600 text-white shadow-lg">
                      <FaCheck className="h-4 w-4" />
                    </div>
                    <span className="text-base font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fade-in-up-delay-2 relative">
              <div className="glass-card hover-lift-3d rounded-3xl p-8">
                <div className="from-primary/20 relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br to-purple-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-primary/20 mb-4 inline-flex items-center justify-center rounded-full p-6">
                        <FaChartLine className="text-primary icon-spin-slow h-16 w-16" />
                      </div>
                      <p className="text-muted-foreground text-sm font-semibold">
                        Dashboard Interativo
                      </p>
                    </div>
                  </div>
                  {/* Efeito shimmer */}
                  <div className="shimmer absolute inset-0" />
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="bg-primary/20 absolute -top-4 -right-4 h-24 w-24 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section com efeito especial */}
      <section className="relative overflow-hidden py-32">
        <div className="animated-gradient absolute inset-0 opacity-10" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="glass-card glow-effect rounded-3xl p-12 text-center sm:p-16 lg:p-20">
              <div className="bg-primary/20 mb-6 inline-flex items-center justify-center rounded-full p-4">
                <FaRocket className="text-primary h-8 w-8" />
              </div>

              <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Pronto para transformar suas finanças?
              </h2>
              <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
                Comece hoje mesmo e descubra como a IA pode te ajudar a alcançar
                seus objetivos financeiros.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="button-glow hover-lift-3d group gap-2 px-10 py-7 text-lg"
                >
                  <FaRocket className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  Criar Conta Grátis
                  <FaArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="hover-lift-3d glass-card px-10 py-7 text-lg"
                >
                  Fazer Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer melhorado */}
      <footer className="glass-card relative border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="group mb-4 flex items-center gap-2">
                <Image
                  src="/logo.png"
                  width={120}
                  height={27}
                  alt="Finance AI"
                  className="h-8 w-auto transition-transform group-hover:scale-110"
                />
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gestão financeira inteligente com IA. Transforme sua relação com
                o dinheiro.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Produto</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Empresa</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Finance AI. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
