import { ReactNode, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { data: profile, isLoading, error } = useProfile();
  const queryClient = useQueryClient();

  // Forçar atualização do perfil quando o componente montar
  useEffect(() => {
    if (!isLoading && !profile) {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }, [isLoading, profile, queryClient]);

  // Forçar refresh do perfil a cada 5 segundos para garantir dados atualizados
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Garantir que o nome seja exibido corretamente
  // Prioridade: name > email (sem @) > "Admin"
  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || "A";
  const userName = profile?.name?.trim() || (profile?.email ? profile.email.split("@")[0] : "Admin");

  // Debug: verificar se o perfil está sendo carregado
  useEffect(() => {
    if (profile) {
      console.log("AdminLayout - Perfil carregado:", { 
        id: profile.id,
        name: profile.name,
        email: profile.email,
        userName,
        userInitial
      });
    }
  }, [profile, userName, userInitial]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold">{title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
            </Button>
            
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20 hidden md:block" />
                </>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {userInitial}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{userName}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-muted/50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
