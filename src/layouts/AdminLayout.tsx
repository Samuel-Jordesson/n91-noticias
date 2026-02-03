import { ReactNode, useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bell, Search, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Carregar estado do localStorage
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

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

  // Salvar estado de collapsed no localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
    <div className="flex min-h-screen font-roboto">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <AdminSidebar 
          onClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
      }`}>
        {/* Top bar */}
        <header className="bg-card border-b border-border px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0 h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-serif font-bold truncate min-w-0">{title}</h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8 sm:pl-10 w-32 sm:w-40 md:w-64 h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative hidden sm:flex h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-accent rounded-full" />
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                  <Skeleton className="h-3 w-16 sm:h-4 sm:w-20 hidden md:block" />
                </>
              ) : (
                <>
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <span className="hidden md:block text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-[120px]">{userName}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-muted/50 overflow-x-hidden">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
