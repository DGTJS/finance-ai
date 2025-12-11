"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { registerUser } from "../_actions/register";
import { PasswordInput } from "./ui/password-input";

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Estados para cadastro
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Mensagens de erro mais específicas
        if (result.error.includes("banco de dados") || result.error.includes("conexão")) {
          setError("Erro de conexão com o banco de dados. Verifique se o MySQL está rodando.");
        } else {
          setError("Email ou senha inválidos");
        }
        setIsLoading(false);
      } else {
        // Forçar atualização da sessão e redirecionar
        // Aguardar um pouco para garantir que a sessão seja atualizada
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.refresh();
        // Usar window.location para garantir que a página seja recarregada completamente
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      if (error.message?.includes("banco de dados") || error.message?.includes("conexão")) {
        setError("Erro de conexão com o banco de dados. Verifique se o MySQL está rodando.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setIsLoading(true);

    try {
      const result = await registerUser({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      if (result.success) {
        setRegisterSuccess(result.message || "Conta criada com sucesso!");
        // Limpar campos
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        // Aguardar 2s e fazer login automático
        setTimeout(async () => {
          await signIn("credentials", {
            email: registerEmail,
            password: registerPassword,
            callbackUrl: "/",
          });
        }, 2000);
      } else {
        setRegisterError(result.error || "Erro ao criar conta");
      }
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      if (error.message?.includes("banco de dados") || error.message?.includes("conexão")) {
        setRegisterError("Erro de conexão com o banco de dados. Verifique se o MySQL está rodando.");
      } else {
        setRegisterError(error.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger value="login">Entrar</TabsTrigger>
        <TabsTrigger value="register">Cadastrar</TabsTrigger>
      </TabsList>

      {/* ABA DE LOGIN */}
      <TabsContent value="login" className="space-y-6">
        {/* Formulário de Email/Senha */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 z-10" />
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full py-6 text-base font-semibold"
            disabled={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Botão Google */}
        <Button
          variant="outline"
          size="lg"
          className="hover:border-primary hover:bg-primary/5 w-full gap-3 border-2 py-6 text-base font-semibold transition-all"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="h-6 w-6" />
          Entrar com Google
        </Button>

        {/* Credenciais de Teste */}
        <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
          <div className="space-y-2">
            <h3 className="text-primary text-sm font-semibold">
              🧪 Credenciais de Teste
            </h3>
            <div className="text-muted-foreground space-y-1 text-xs">
              <p>
                <strong>Email:</strong> teste@finance.ai
              </p>
              <p>
                <strong>Senha:</strong> 123456
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ABA DE CADASTRO */}
      <TabsContent value="register" className="space-y-6">
        {registerSuccess ? (
          <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-green-500">
              Conta criada com sucesso!
            </h3>
            <p className="text-muted-foreground text-sm">Redirecionando...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="pl-10"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 z-10" />
                  <PasswordInput
                    id="register-password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Mínimo de 6 caracteres
                </p>
              </div>

              {registerError && (
                <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                  {registerError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full py-6 text-base font-semibold"
                disabled={isLoading}
              >
                Criar Conta
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Ou cadastre-se com
                </span>
              </div>
            </div>

            {/* Botão Google */}
            <Button
              variant="outline"
              size="lg"
              className="hover:border-primary hover:bg-primary/5 w-full gap-3 border-2 py-6 text-base font-semibold transition-all"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle className="h-6 w-6" />
              Cadastrar com Google
            </Button>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LoginForm;
