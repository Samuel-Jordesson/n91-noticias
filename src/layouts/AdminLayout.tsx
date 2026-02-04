import { ReactNode, useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationDropdown from "@/components/admin/NotificationDropdown";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
        <header className="h-16 border-b border-slate-100 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0 h-9 w-9 hover:bg-slate-50"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-bold text-[#21366B] tracking-tight">{title}</h2>
          </div>

          <div className="flex-1 max-w-xl px-12 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#21366B] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="O que você está procurando?" 
                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 rounded-xl py-2 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NotificationDropdown />
            </div>
            
            <div className="h-6 w-px bg-slate-100 mx-2" />
            
            <button className="flex items-center gap-3 p-1 pl-1 pr-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="hidden sm:flex flex-col items-start">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="w-8 h-8 rounded-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={userName} />
                    <AvatarFallback className="bg-[#21366B] text-white text-xs font-bold rounded-lg">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-sm font-semibold text-slate-700 leading-tight">{userName}</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 bg-slate-50 overflow-x-hidden">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
