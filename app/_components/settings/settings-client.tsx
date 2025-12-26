"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/password-input";
import {
  User,
  Bell,
  Shield,
  DollarSign,
  Trash2,
  Save,
  Settings,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { FaSync } from "react-icons/fa";
import { toast } from "sonner";
import { saveUserSettings } from "@/app/_actions/user-settings";
import { updateUserProfile } from "@/app/_actions/user-profile";
import FamilyUsersTab from "./family-users-tab";
import Image from "next/image";

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
  type: string;
  createdAt: Date;
}

interface SettingsClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accounts: LinkedAccount[];
  initialSettings?: {
    userTitle?: string | null;
    hfApiKey?: string | null;
    closingDay?: number | null;
    savingsGoal?: number | null;
    emailNotifications?: boolean | null;
    subscriptionAlerts?: boolean | null;
    transactionAlerts?: boolean | null;
    aiInsights?: boolean | null;
  } | null;
  familyAccount?: {
    id: string;
    name: string;
    users: Array<{
      id: string;
      name: string | null;
      email: string;
      createdAt: Date;
    }>;
  } | null;
}

export default function SettingsClient({
  user,
  initialSettings,
}: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Configurações de perfil
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [imagePreview, setImagePreview] = useState(user.image || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [userTitle, setUserTitle] = useState(
    initialSettings?.userTitle || "Gerente Financeiro",
  );

  // Configurações financeiras
  const [closingDay, setClosingDay] = useState(
    initialSettings?.closingDay || 5,
  );
  const [savingsGoal, setSavingsGoal] = useState(
    initialSettings?.savingsGoal || 0,
  );
  const [isSavingFinancial, setIsSavingFinancial] = useState(false);

  // Configurações de notificações
  const [emailNotifications, setEmailNotifications] = useState(
    initialSettings?.emailNotifications ?? true,
  );
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(
    initialSettings?.subscriptionAlerts ?? true,
  );
  const [transactionAlerts, setTransactionAlerts] = useState(
    initialSettings?.transactionAlerts ?? false,
  );
  const [aiInsights, setAiInsights] = useState(
    initialSettings?.aiInsights ?? true,
  );

  // Configurações de IA
  const [hfApiKey, setHfApiKey] = useState(initialSettings?.hfApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  // Configurações de segurança
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMounted(true);
    // Verificar se há uma aba específica na URL
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Sincronizar imagem quando o usuário mudar
  useEffect(() => {
    if (user.image) {
      setImagePreview(user.image);
      setImage(user.image);
    } else {
      setImagePreview("");
      setImage("");
    }
  }, [user.image]);

  if (!mounted) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (!name || !email) {
      toast.error("Preencha todos os campos!");
      return;
    }

    // Bloquear salvamento se estiver fazendo upload
    if (isUploadingImage) {
      toast.error("Aguarde o upload da foto terminar antes de salvar");
      return;
    }

    try {
      console.log("🔄 Salvando perfil...", { name, email, hasImage: !!image });

      // Preparar dados da imagem
      let imageToSave: string | null = null;
      if (image && image.trim()) {
        imageToSave = image; // Manter a string base64 completa como está
        console.log(
          "📤 Enviando imagem para salvar, tamanho:",
          imageToSave.length,
          "caracteres",
        );
        console.log(
          "📤 Primeiros 50 caracteres:",
          imageToSave.substring(0, 50),
        );
      } else {
        console.log("ℹ️ Nenhuma imagem para salvar");
      }

      console.log("📤 Dados a serem enviados:", {
        name: name.trim(),
        email: email.trim(),
        hasImage: !!imageToSave,
        imageLength: imageToSave?.length || 0,
      });

      const result = await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        image: imageToSave,
      });

      console.log("📊 Resultado:", result);

      // Salvar também o título personalizado nas configurações
      if (result.success) {
        const settingsResult = await saveUserSettings({
          userTitle: userTitle.trim() || "Gerente Financeiro",
        });

        if (!settingsResult.success) {
          console.warn(
            "⚠️ Aviso: Não foi possível salvar o título personalizado:",
            settingsResult.error,
          );
        }
      }

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
        // Atualizar a sessão do NextAuth para refletir as mudanças
        await updateSession();
        // Forçar atualização da sessão e da página
        // Primeiro, revalidar as rotas
        router.refresh();
        // Depois, recarregar a página para garantir que a sessão seja atualizada
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("❌ Erro ao atualizar:", result.error);
        toast.error(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      toast.error(
        "Erro ao atualizar perfil. Verifique o console para mais detalhes.",
      );
    }
  };

  const handleSaveFinancial = async () => {
    setIsSavingFinancial(true);
    try {
      const result = await saveUserSettings({
        closingDay,
        savingsGoal,
      });

      if (result.success) {
        toast.success("Configurações financeiras salvas!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações financeiras:", error);
      toast.error("Erro ao salvar configurações financeiras");
    } finally {
      setIsSavingFinancial(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("emailNotifications", emailNotifications.toString());
    localStorage.setItem("subscriptionAlerts", subscriptionAlerts.toString());
    localStorage.setItem("transactionAlerts", transactionAlerts.toString());
    localStorage.setItem("aiInsights", aiInsights.toString());
    toast.success("Preferências de notificações salvas!");
  };

  const handleSaveAI = () => {
    localStorage.setItem("hfApiKey", hfApiKey);
    toast.success("Configurações de IA salvas!");
    toast.info(
      "Nota: Para usar a API da Hugging Face, você também precisa configurar HF_API_KEY nas variáveis de ambiente do servidor.",
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    try {
      const { changePassword } = await import("@/app/_actions/change-password");
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success(result.message || "Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "Erro ao alterar senha");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha. Tente novamente.");
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Tem certeza que deseja deletar sua conta? Esta ação é irreversível!",
      )
    ) {
      // TODO: Implementar exclusão de conta
      toast.error("Funcionalidade em desenvolvimento");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="flex flex-col gap-2 text-2xl font-bold sm:flex-row sm:items-center sm:text-3xl">
          <Settings className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Mobile: Select */}
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </div>
              </SelectItem>
              <SelectItem value="users">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Usuários</span>
                </div>
              </SelectItem>
              <SelectItem value="financial">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Financeiro</span>
                </div>
              </SelectItem>
              <SelectItem value="notifications">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificações</span>
                </div>
              </SelectItem>
              <SelectItem value="ai">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>IA</span>
                </div>
              </SelectItem>
              <SelectItem value="security">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Segurança</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden sm:block">
          <div className="bg-muted/50 rounded-lg p-1">
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent lg:grid-cols-7">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <User className="h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Financeiro</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span>Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>IA</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span>Segurança</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative overflow-hidden">
                  {imagePreview ? (
                    <div className="border-primary/20 h-16 w-16 overflow-hidden rounded-full border-2 sm:h-20 sm:w-20">
                      <Image
                        src={imagePreview}
                        alt={name || "Perfil"}
                        className="h-full w-full object-cover object-center"
                        style={{
                          objectPosition: "center center",
                          minWidth: "100%",
                          minHeight: "100%",
                        }}
                        width={80}
                        height={80}
                        unoptimized
                        onError={(e) => {
                          // Se a imagem falhar ao carregar, mostrar inicial
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                          const parent = (e.currentTarget as HTMLImageElement)
                            .parentElement?.parentElement;
                          if (parent) {
                            const fallback =
                              parent.querySelector(".fallback-avatar");
                            if (fallback) {
                              (fallback as HTMLElement).style.display = "flex";
                            }
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div
                    className={`bg-primary text-primary-foreground fallback-avatar flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold sm:h-20 sm:w-20 sm:text-3xl ${imagePreview ? "hidden" : ""}`}
                  >
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Validar tamanho (2MB original, mas vamos comprimir antes)
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("A imagem deve ter no máximo 5MB");
                        return;
                      }

                      // Validar tipo
                      if (!file.type.startsWith("image/")) {
                        toast.error(
                          "Por favor, selecione um arquivo de imagem",
                        );
                        return;
                      }

                      setIsUploadingImage(true);
                      toast.info("Carregando e comprimindo foto...");
                      try {
                        // Comprimir a imagem antes de converter para base64
                        const compressImage = (
                          file: File,
                          maxWidth: number = 300,
                          maxHeight: number = 300,
                          quality: number = 0.5,
                        ): Promise<string> => {
                          return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              // const img = new Image();
                              const img = document.createElement("img");
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                let width = img.width;
                                let height = img.height;

                                // Calcular novas dimensões mantendo proporção
                                if (width > height) {
                                  if (width > maxWidth) {
                                    height = (height * maxWidth) / width;
                                    width = maxWidth;
                                  }
                                } else {
                                  if (height > maxHeight) {
                                    width = (width * maxHeight) / height;
                                    height = maxHeight;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;

                                const ctx = canvas.getContext("2d");
                                if (!ctx) {
                                  reject(
                                    new Error(
                                      "Não foi possível criar contexto do canvas",
                                    ),
                                  );
                                  return;
                                }

                                // Desenhar imagem redimensionada
                                ctx.drawImage(img, 0, 0, width, height);

                                // Converter para base64 com qualidade ajustada
                                const base64String = canvas.toDataURL(
                                  "image/jpeg",
                                  quality,
                                );
                                resolve(base64String);
                              };
                              img.onerror = () =>
                                reject(new Error("Erro ao carregar imagem"));
                              img.src = e.target?.result as string;
                            };
                            reader.onerror = () =>
                              reject(new Error("Erro ao ler arquivo"));
                            reader.readAsDataURL(file);
                          });
                        };

                        // Comprimir e converter para base64
                        const base64String = await compressImage(file);

                        // Verificar se a string base64 está completa
                        if (!base64String || base64String.length < 100) {
                          toast.error(
                            "Erro: Imagem não foi carregada completamente",
                          );
                          setIsUploadingImage(false);
                          return;
                        }

                        // Verificar se começa com data:image
                        if (!base64String.startsWith("data:image/")) {
                          toast.error("Erro: Formato de imagem inválido");
                          setIsUploadingImage(false);
                          return;
                        }

                        // Verificar se termina corretamente (base64 válido)
                        const base64Data =
                          base64String.split(",")[1] || base64String;
                        if (!base64Data || base64Data.length === 0) {
                          toast.error("Erro: Dados da imagem inválidos");
                          setIsUploadingImage(false);
                          return;
                        }

                        // Verificar se a imagem comprimida não excede 200KB base64 (~150KB original)
                        // Reduzido para evitar erro 431 (Request Header Fields Too Large)
                        const maxSize = 200 * 1024; // 200KB em caracteres base64
                        let finalBase64 = base64String;
                        if (base64String.length > maxSize) {
                          // Comprimir ainda mais se necessário (200x200, qualidade 0.4)
                          finalBase64 = await compressImage(
                            file,
                            200,
                            200,
                            0.4,
                          );
                          if (finalBase64.length > maxSize) {
                            toast.warning(
                              "Imagem muito grande. Será redimensionada para um tamanho menor.",
                            );
                            // Última tentativa com tamanho ainda menor
                            finalBase64 = await compressImage(
                              file,
                              150,
                              150,
                              0.3,
                            );
                            // Se ainda for muito grande, rejeitar
                            if (finalBase64.length > maxSize) {
                              toast.error(
                                "Imagem muito grande mesmo após compressão. Por favor, use uma imagem menor (máximo 200KB).",
                              );
                              setIsUploadingImage(false);
                              return;
                            }
                          }
                        }

                        console.log(
                          "📸 Imagem comprimida e convertida para base64, tamanho:",
                          finalBase64.length,
                          "caracteres",
                        );
                        console.log(
                          "📸 Primeiros 100 caracteres:",
                          finalBase64.substring(0, 100),
                        );
                        console.log(
                          "📸 Últimos 50 caracteres:",
                          finalBase64.substring(finalBase64.length - 50),
                        );

                        // Criar uma imagem para testar se está completa
                        // const testImg = new Image();
                        const testImg = document.createElement("img");
                        testImg.onload = () => {
                          console.log(
                            "✅ Imagem carregada com sucesso, dimensões:",
                            testImg.width,
                            "x",
                            testImg.height,
                          );
                          console.log(
                            "✅ Tamanho final da string base64:",
                            finalBase64.length,
                            "caracteres",
                          );
                          setImagePreview(finalBase64);
                          setImage(finalBase64);
                          setIsUploadingImage(false);
                          toast.success(
                            "Foto carregada e comprimida! Clique em 'Salvar Alterações' para salvar.",
                          );
                        };
                        testImg.onerror = () => {
                          console.error("❌ Erro ao validar imagem");
                          toast.error("Erro: Imagem corrompida ou inválida");
                          setIsUploadingImage(false);
                        };
                        testImg.src = finalBase64;
                      } catch (error) {
                        console.error("❌ Erro ao processar imagem:", error);
                        toast.error(
                          "Erro ao processar imagem: " +
                            (error instanceof Error
                              ? error.message
                              : "Erro desconhecido"),
                        );
                        setIsUploadingImage(false);
                      }
                    }}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full cursor-pointer sm:w-auto"
                      disabled={isUploadingImage}
                      asChild
                    >
                      <span className="flex items-center gap-2">
                        {isUploadingImage ? (
                          <>
                            <FaSync className="h-3 w-3 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          "Alterar Foto"
                        )}
                      </span>
                    </Button>
                  </label>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-red-500 hover:text-red-600 sm:w-auto"
                      onClick={() => {
                        setImagePreview("");
                        setImage("");
                        toast.info(
                          "Foto removida. Clique em 'Salvar Alterações' para confirmar.",
                        );
                      }}
                    >
                      Remover Foto
                    </Button>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    JPG, PNG ou GIF (máx. 2MB)
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
                <p className="text-muted-foreground text-xs">
                  Este email será usado para login e notificações
                </p>
              </div>

              {/* Título Personalizado */}
              <div className="space-y-2">
                <Label htmlFor="userTitle">
                  Título/Cargo (exibido na sidebar)
                </Label>
                <Input
                  id="userTitle"
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  placeholder="Ex: Gerente Financeiro, Analista, etc."
                />
                <p className="text-muted-foreground text-xs">
                  Personalize o título que aparece abaixo do seu nome na sidebar
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full gap-2"
                disabled={isUploadingImage}
              >
                <Save className="h-4 w-4" />
                {isUploadingImage ? "Aguarde o upload..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuários da Conta */}
        <TabsContent value="users" className="space-y-6">
          <FamilyUsersTab currentUserId={user.id || ""} />
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Financeiras</CardTitle>
              <CardDescription>
                Configure como você visualiza e gerencia suas finanças
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dia de fechamento */}
              <div className="space-y-2">
                <Label htmlFor="closingDay">Dia de Fechamento</Label>
                <Input
                  id="closingDay"
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(parseInt(e.target.value) || 1)}
                />
                <p className="text-muted-foreground text-xs">
                  Dia do mês para cálculo de previsões e fechamento de fatura
                </p>
              </div>

              {/* Meta de economia */}
              <div className="space-y-2">
                <Label htmlFor="savingsGoal">Meta de Economia Mensal</Label>
                <Input
                  id="savingsGoal"
                  type="number"
                  placeholder="0,00"
                  value={savingsGoal}
                  onChange={(e) =>
                    setSavingsGoal(parseFloat(e.target.value) || 0)
                  }
                  step="0.01"
                  min="0"
                />
                <p className="text-muted-foreground text-xs">
                  Quanto você deseja economizar por mês
                </p>
              </div>

              <Button
                onClick={handleSaveFinancial}
                className="w-full gap-2"
                disabled={isSavingFinancial}
              >
                {isSavingFinancial ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Escolha como e quando deseja ser notificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email notifications */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label>Notificações por Email</Label>
                  <p className="text-muted-foreground text-sm">
                    Receber resumos e alertas por email
                  </p>
                </div>
                <Button
                  variant={emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className="w-full sm:w-auto"
                >
                  {emailNotifications ? "Ativado" : "Desativado"}
                </Button>
              </div>

              {/* Subscription alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas de Assinaturas</Label>
                  <p className="text-muted-foreground text-sm">
                    Avisos sobre assinaturas vencendo
                  </p>
                </div>
                <Button
                  variant={subscriptionAlerts ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubscriptionAlerts(!subscriptionAlerts)}
                >
                  {subscriptionAlerts ? "Ativado" : "Desativado"}
                </Button>
              </div>

              {/* Transaction alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas de Transações</Label>
                  <p className="text-muted-foreground text-sm">
                    Notificações sobre gastos elevados
                  </p>
                </div>
                <Button
                  variant={transactionAlerts ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransactionAlerts(!transactionAlerts)}
                >
                  {transactionAlerts ? "Ativado" : "Desativado"}
                </Button>
              </div>

              {/* AI insights */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Insights da IA</Label>
                  <p className="text-muted-foreground text-sm">
                    Dicas e análises financeiras automáticas
                  </p>
                </div>
                <Button
                  variant={aiInsights ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiInsights(!aiInsights)}
                >
                  {aiInsights ? "Ativado" : "Desativado"}
                </Button>
              </div>

              <Button
                onClick={handleSaveNotifications}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Inteligência Artificial</CardTitle>
              <CardDescription>
                Configure a API da Hugging Face para respostas mais avançadas da
                IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hfApiKey">Chave da API Hugging Face</Label>
                <div className="relative">
                  <Input
                    id="hfApiKey"
                    type={showApiKey ? "text" : "password"}
                    value={hfApiKey}
                    onChange={(e) => setHfApiKey(e.target.value)}
                    placeholder="hf_seu_token_aqui"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  A IA funciona sem esta chave usando fallback local. Para
                  respostas mais avançadas, adicione sua chave da Hugging Face.
                </p>
                <div className="bg-muted/50 rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    Como obter uma chave:
                  </p>
                  <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-xs">
                    <li>
                      Acesse{" "}
                      <a
                        href="https://huggingface.co"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        huggingface.co
                      </a>
                    </li>
                    <li>Crie uma conta ou faça login</li>
                    <li>Vá em Settings &gt; Access Tokens</li>
                    <li>
                      Crie um token de <strong>Read</strong>
                    </li>
                    <li>
                      Cole o token aqui (começa com{" "}
                      <code className="bg-background rounded px-1">hf_</code>)
                    </li>
                  </ol>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    <strong>Informação:</strong> Sua chave da API será
                    armazenada de forma segura e individual para sua conta. Cada
                    usuário pode ter sua própria chave configurada.
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveAI} className="w-full gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações de IA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <PasswordInput
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a nova senha novamente"
                />
              </div>

              <Button onClick={handleChangePassword} className="w-full gap-2">
                <Shield className="h-4 w-4" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis que afetam sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Deletar Conta</h3>
                <p className="text-muted-foreground text-sm">
                  Esta ação removerá permanentemente sua conta e todos os dados
                  associados. Esta ação não pode ser desfeita.
                </p>
              </div>

              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Deletar Conta Permanentemente
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
