import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "../_components/login-form";

const LoginPage = async () => {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <div className="grid h-full min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Coluna Esquerda - Formulário */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-[450px]">
          {/* Logo */}
          <div className="mb-10">
            <Image
              src="/logo.png"
              width={173}
              height={39}
              alt="Finance AI"
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Título e Descrição */}
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Bem-vindo à Finance AI
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              A Finance AI é uma plataforma de gestão financeira que utiliza IA
              para monitorar suas movimentações e oferecer insights
              personalizados, facilitando o controle do seu orçamento.
            </p>
          </div>

          {/* Formulário de Login */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-primary hover:underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Imagem */}
      <div className="relative hidden lg:block">
        <Image
          src="/login.png"
          alt="Imagem de Login"
          fill
          className="object-cover"
          priority
        />
        <div className="from-background/80 via-background/50 to-background/30 absolute inset-0 bg-gradient-to-t" />

        {/* Overlay com informações */}
        <div className="absolute right-0 bottom-0 left-0 p-10 text-white">
          <blockquote className="space-y-4">
            <p className="text-lg font-medium">
              "A Finance AI transformou completamente a forma como gerencio
              minhas finanças. Agora tenho controle total e insights incríveis!"
            </p>
            <footer className="text-sm opacity-80">
              — Maria Silva, Usuária Premium
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
