import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useSignIn } from "@/hooks/useAuth";
import { getCurrentProfile, signOut } from "@/services/auth";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signInMutation = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const loginResult = await signInMutation.mutateAsync({ email, password });
      
      // Invalidar cache do perfil antes de buscar
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Aguardar um pouco e verificar perfil
      setTimeout(async () => {
        try {
          // Forçar refetch do perfil
          const profileData = await getCurrentProfile();
          
          // Atualizar cache manualmente
          if (loginResult?.user?.id) {
            await queryClient.setQueryData(["profile", loginResult.user.id], profileData);
          }
          
          // Verificar se é admin, editor ou dev
          if (profileData?.role === 'admin' || profileData?.role === 'editor' || profileData?.role === 'dev') {
            toast.success(`Login realizado com sucesso! Bem-vindo, ${profileData.name}`);
            navigate("/admin/dashboard");
          } else {
            toast.error("Acesso negado. Apenas administradores e editores podem acessar.");
            await signOut();
            await queryClient.clear();
          }
        } catch (error) {
          console.error("Erro ao verificar perfil:", error);
          toast.error("Erro ao verificar perfil. Tente fazer login novamente.");
        }
      }, 500);
    } catch (error: any) {
      // Ignorar erro de email não confirmado - o signIn já tenta contornar isso
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        // Tentar verificar se conseguiu fazer login mesmo assim
        setTimeout(async () => {
          try {
            const profileData = await getCurrentProfile();
            if (profileData) {
              // Se conseguiu obter o perfil, o login funcionou
              if (profileData?.role === 'admin' || profileData?.role === 'editor') {
                toast.success("Login realizado com sucesso!");
                navigate("/admin/dashboard");
                return;
              }
            }
          } catch (profileError) {
            // Se não conseguiu, mostrar erro genérico
            toast.error("Email ou senha incorretos");
          }
        }, 1000);
        return; // Não mostrar erro ainda, aguardar verificação do perfil
      }
      toast.error(error.message || "Email ou senha incorretos");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 font-roboto">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-roboto font-black text-primary">N91</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Área Administrativa</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <h2 className="text-2xl font-roboto font-bold text-center mb-6">
            Entrar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
              {signInMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
