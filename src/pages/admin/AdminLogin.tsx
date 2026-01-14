import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const signInMutation = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInMutation.mutateAsync({ email, password });
      
      // Aguardar um pouco e verificar perfil
      setTimeout(async () => {
        try {
          const profileData = await getCurrentProfile();
          
          // Verificar se é admin ou editor
          if (profileData?.role === 'admin' || profileData?.role === 'editor') {
            toast.success("Login realizado com sucesso!");
            navigate("/admin/dashboard");
          } else {
            toast.error("Acesso negado. Apenas administradores e editores podem acessar.");
            await signOut();
          }
        } catch (error) {
          toast.error("Erro ao verificar perfil");
        }
      }, 500);
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        toast.error("Email não confirmado. Se você desativou a confirmação de email no Supabase, confirme o email do usuário manualmente no Dashboard do Supabase (Authentication > Users > [usuário] > Confirm email).", {
          duration: 8000,
        });
      } else {
        toast.error(error.message || "Email ou senha incorretos");
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-serif font-black text-primary">N91</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Área Administrativa</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <h2 className="text-2xl font-serif font-bold text-center mb-6">
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
