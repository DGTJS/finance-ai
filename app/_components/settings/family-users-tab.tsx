"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  UserPlus,
  Save,
  Trash2,
  Edit,
  X,
  Users,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getFamilyAccount,
  addUserToFamilyAccount,
  updateFamilyAccountUser,
  removeUserFromFamilyAccount,
} from "@/app/_actions/family-account";
import { getUserSettingsByUserId } from "@/app/_actions/user-settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface FamilyUser {
  id: string;
  name: string | null;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: Date;
}

interface FamilyUsersTabProps {
  currentUserId: string;
  initialFamilyAccount?: {
    id: string;
    name: string;
    users: FamilyUser[];
  } | null;
}

export default function FamilyUsersTab({
  currentUserId,
  initialFamilyAccount,
}: FamilyUsersTabProps) {
  const [familyAccount, setFamilyAccount] = useState(initialFamilyAccount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"OWNER" | "ADMIN" | "MEMBER">("MEMBER");
  const [editUserTitle, setEditUserTitle] = useState("");

  useEffect(() => {
    if (initialFamilyAccount) {
      setFamilyAccount(initialFamilyAccount);
    }
  }, [initialFamilyAccount]);

  const refreshFamilyAccount = async () => {
    setIsLoading(true);
    try {
      const result = await getFamilyAccount();
      if (result.success && result.data) {
        setFamilyAccount(result.data);
      }
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addUserToFamilyAccount({
        name,
        email,
        password,
      });

      if (result.success) {
        toast.success("Usuário adicionado com sucesso!");
        setName("");
        setEmail("");
        setPassword("");
        setIsAdding(false);
        await refreshFamilyAccount();
      } else {
        toast.error(result.error || "Erro ao adicionar usuário");
      }
    } catch (error) {
      toast.error("Erro ao adicionar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (user: FamilyUser) => {
    setEditingId(user.id);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role);
    
    // Buscar o userTitle do usuário
    try {
      const settingsResult = await getUserSettingsByUserId(user.id);
      if (settingsResult.success && settingsResult.data) {
        setEditUserTitle(settingsResult.data.userTitle || "Gerente Financeiro");
      } else {
        setEditUserTitle("Gerente Financeiro");
      }
    } catch (error) {
      console.error("Erro ao buscar título do usuário:", error);
      setEditUserTitle("Gerente Financeiro");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setIsLoading(true);
    try {
      const updateData: any = { id: editingId };
      if (editName) updateData.name = editName;
      if (editEmail) updateData.email = editEmail;
      if (editPassword) updateData.password = editPassword;
      if (editRole) updateData.role = editRole;
      if (editUserTitle !== undefined) updateData.userTitle = editUserTitle || null;

      const result = await updateFamilyAccountUser(updateData);

      if (result.success) {
        toast.success("Usuário atualizado com sucesso!");
        setEditingId(null);
        setEditName("");
        setEditEmail("");
        setEditPassword("");
        setEditUserTitle("");
        await refreshFamilyAccount();
      } else {
        toast.error(result.error || "Erro ao atualizar usuário");
      }
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await removeUserFromFamilyAccount(deleteId);

      if (result.success) {
        toast.success("Usuário removido com sucesso!");
        setDeleteId(null);
        await refreshFamilyAccount();
      } else {
        toast.error(result.error || "Erro ao remover usuário");
      }
    } catch (error) {
      toast.error("Erro ao remover usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "Usuário";
    return fullName.split(" ")[0];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case "ADMIN":
        return <Shield className="h-3 w-3 text-blue-600" />;
      default:
        return <User className="h-3 w-3 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Dono";
      case "ADMIN":
        return "Administrador";
      default:
        return "Membro";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários da Conta
          </CardTitle>
          <CardDescription>
            Gerencie os usuários que têm acesso à mesma conta compartilhada. Cada
            usuário pode fazer login com seu próprio email e senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de usuários */}
          {familyAccount && familyAccount.users.length > 0 ? (
            <div className="space-y-3">
              {familyAccount.users.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                const isEditing = editingId === user.id;
                const currentUserRole = familyAccount.users.find(u => u.id === currentUserId)?.role || "MEMBER";
                const canEdit = currentUserRole === "OWNER" || (currentUserRole === "ADMIN" && user.role !== "OWNER");
                const canRemove = currentUserRole === "OWNER" || (currentUserRole === "ADMIN" && user.role !== "OWNER");

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {isEditing ? (
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Título/Cargo (exibido na sidebar)</Label>
                          <Input
                            value={editUserTitle}
                            onChange={(e) => setEditUserTitle(e.target.value)}
                            placeholder="Ex: Gerente Financeiro, Analista, etc."
                          />
                          <p className="text-muted-foreground text-xs">
                            Personalize o título que aparece abaixo do nome do usuário na sidebar
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Nova Senha (deixe em branco para não alterar)</Label>
                          <PasswordInput
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Nova senha"
                          />
                        </div>
                        {currentUserRole === "OWNER" && (
                          <div className="space-y-2">
                            <Label>Permissão</Label>
                            <Select value={editRole} onValueChange={(value: "OWNER" | "ADMIN" | "MEMBER") => setEditRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="OWNER">
                                  <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-600" />
                                    <span>Dono - Acesso total</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <span>Administrador - Gerencia usuários</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="MEMBER">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-600" />
                                    <span>Membro - Acesso limitado</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                              <p className="text-muted-foreground text-xs font-semibold">
                                Explicação das Permissões:
                              </p>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-start gap-2">
                                  <Crown className="h-3 w-3 text-yellow-600 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-medium">Dono:</span>
                                    <span className="text-muted-foreground ml-1">
                                      Acesso total. Pode gerenciar todos os usuários, alterar permissões e excluir a conta.
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Shield className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-medium">Administrador:</span>
                                    <span className="text-muted-foreground ml-1">
                                      Pode adicionar e remover membros, mas não pode alterar permissões ou editar o dono.
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <User className="h-3 w-3 text-gray-600 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-medium">Membro:</span>
                                    <span className="text-muted-foreground ml-1">
                                      Acesso limitado. Pode visualizar e criar transações, mas não pode gerenciar outros usuários.
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-muted-foreground text-xs pt-1 border-t">
                                Apenas o dono da conta pode alterar permissões
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditName("");
                              setEditEmail("");
                              setEditPassword("");
                              setEditRole("MEMBER");
                              setEditUserTitle("");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-12 sm:w-12 sm:text-base">
                            {getFirstName(user.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {getFirstName(user.name)}
                              </h3>
                              {isCurrentUser && (
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                  Você
                                </span>
                              )}
                              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                {getRoleIcon(user.role)}
                                <span className="text-muted-foreground">{getRoleLabel(user.role)}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {user.email}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Adicionado em{" "}
                              {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        {!isCurrentUser && (canEdit || canRemove) && (
                          <div className="flex gap-2">
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                            )}
                            {canRemove && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setDeleteId(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-2 font-semibold">Nenhum usuário adicional</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Adicione usuários para compartilhar a mesma conta financeira
              </p>
              {/* Botão para adicionar primeiro usuário */}
              <Button
                onClick={() => setIsAdding(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Usuário
              </Button>
            </div>
          )}

          {/* Botão para abrir modal de adicionar usuário (quando já há usuários) */}
          {familyAccount && familyAccount.users.length > 0 && (() => {
            const currentUserRole = familyAccount.users.find(u => u.id === currentUserId)?.role || "MEMBER";
            const canAddUsers = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
            
            if (!canAddUsers) return null;
            
            return (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Novo Usuário
              </Button>
            );
          })()}

          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">💡 Como funciona</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Cada usuário pode fazer login com seu próprio email e senha</li>
              <li>• Todos os usuários compartilham as mesmas transações e dados financeiros</li>
              <li>• As transações mostram quem as criou (primeiro nome)</li>
              <li>• Você pode editar ou remover outros usuários (exceto a si mesmo)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de adicionar usuário */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Novo Usuário
            </DialogTitle>
            <DialogDescription>
              Adicione um novo usuário à conta compartilhada. Ele poderá fazer login
              com o email e senha fornecidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome</Label>
              <Input
                id="add-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUser();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUser();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Senha</Label>
              <PasswordInput
                id="add-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUser();
                  }
                }}
              />
              <p className="text-muted-foreground text-xs">
                A senha será usada para fazer login na conta compartilhada.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setName("");
                setEmail("");
                setPassword("");
              }}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isLoading || !name || !email || !password}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este usuário da conta compartilhada?
              Ele não poderá mais fazer login, mas as transações criadas por ele
              serão mantidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

