import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAllProfiles, useCreateUser, useUpdateUserProfile, useDeleteUser } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels = {
  admin: { label: "Administrador", className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  editor: { label: "Editor", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  user: { label: "Usuário", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  dev: { label: "Desenvolvedor", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

const AdminUsers = () => {
  const { data: users = [], isLoading } = useAllProfiles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUserProfile();
  const deleteUserMutation = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "user" | "dev">("user");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || (!editingUser && !password)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingUser) {
        // Atualizar usuário existente
        await updateUserMutation.mutateAsync({
          userId: editingUser.id,
          updates: {
            name,
            email,
            role,
          },
        });
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário
        await createUserMutation.mutateAsync({
          email,
          password,
          name,
          role,
        });
        toast.success("Usuário criado com sucesso!");
      }

      setIsDialogOpen(false);
      handleCancel();
    } catch (error: any) {
      // Tratamento específico para rate limiting
      if (error.message?.includes('rate limit') || error.message?.includes('Too Many Requests') || error.message?.includes('aguarde')) {
        toast.error(error.message || "Muitas requisições. Aguarde alguns segundos antes de tentar novamente.", {
          duration: 5000,
        });
      } else if (error.message?.includes('already registered') || error.message?.includes('já está cadastrado')) {
        toast.error("Este email já está cadastrado no sistema.");
      } else {
        toast.error(error.message || "Erro ao salvar usuário");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    const user = users.find(u => u.id === id);
    if (user?.role === "admin") {
      toast.error("Não é possível excluir um administrador");
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(id);
      toast.success("Usuário excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir usuário");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  return (
    <AdminLayout title="Gerenciar Usuários">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-48 h-8 sm:h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="dev">Desenvolvedor</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base sm:text-lg md:text-xl">{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-4">
              {createUserMutation.isError && (
                <div className="bg-[#47B354]/10 dark:bg-[#47B354]/20 border border-[#47B354]/30 dark:border-[#47B354]/40 rounded-lg p-3 text-sm text-[#47B354] dark:text-[#47B354]">
                  <p className="font-medium">Atenção: Limite de requisições</p>
                  <p className="mt-1">Se você receber um erro de "Too Many Requests", aguarde 30-60 segundos antes de tentar novamente.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={role} onValueChange={(value: "admin" | "editor" | "user" | "dev") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="dev">Desenvolvedor</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    handleCancel();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {editingUser ? "Atualizar" : "Criar"} Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] sm:min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Usuário
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Função
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Desde
                  </th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 sm:py-8 p-3 sm:p-0">
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-10 sm:h-12 w-full" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground p-3 sm:p-0">
                      {searchTerm || filterRole !== "all"
                        ? "Nenhum usuário encontrado com os filtros aplicados"
                        : "Nenhum usuário cadastrado ainda"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-xs sm:text-sm truncate block">{user.name}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground md:hidden truncate block">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                        {user.email}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            roleLabels[user.role as keyof typeof roleLabels].className
                          }`}
                        >
                          {(user.role === "admin" || user.role === "dev") && <Shield className="h-3 w-3" />}
                          {roleLabels[user.role as keyof typeof roleLabels].label}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "N/A"}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            title="Editar usuário"
                            className="h-7 w-7 sm:h-9 sm:w-9"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-7 w-7 sm:h-9 sm:w-9"
                            onClick={() => handleDelete(user.id)}
                            disabled={(user.role === "admin" || user.role === "dev") || deleteUserMutation.isPending}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
