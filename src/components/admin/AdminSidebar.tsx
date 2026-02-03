import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  Settings,
  LogOut,
  MessageSquare,
  Bot,
  Briefcase,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSetting } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useAuth";
import { Code } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FileText, label: "Posts", path: "/admin/posts" },
  { icon: Briefcase, label: "Empregos", path: "/admin/empregos" },
  { icon: FolderTree, label: "Categorias", path: "/admin/categories" },
  { icon: MessageSquare, label: "Comentários", path: "/admin/comments" },
  { icon: Megaphone, label: "Anúncios", path: "/admin/ads" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Bot, label: "Automação IA", path: "/admin/automation" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

const devMenuItems = [
  { icon: Code, label: "Desenvolvimento", path: "/admin/development" },
];

interface AdminSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminSidebar = ({ onClose, collapsed = false, onToggleCollapse }: AdminSidebarProps) => {
  const location = useLocation();
  const { data: logoUrl } = useSetting('site_logo');
  const { data: profile } = useProfile();
  const isDev = profile?.role === 'dev';

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const SidebarLink = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => {
    const linkContent = (
      <Link
        to={item.path}
        onClick={handleLinkClick}
        className={`admin-sidebar-link ${isActive ? "active" : ""} ${
          collapsed ? "justify-center px-2" : ""
        }`}
      >
        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm sm:text-base">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  return (
    <aside className={`admin-sidebar flex flex-col h-full transition-all duration-300 overflow-hidden ${
      collapsed ? "w-16 lg:w-16" : "w-64 lg:w-72"
    }`}>
      {/* Logo e Botão Toggle */}
      <div className={`border-b border-white/10 relative ${
        collapsed ? "p-4" : "p-4 sm:p-6"
      }`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-block" onClick={handleLinkClick}>
            <img 
              src={logoUrl || "/imagens/Logo.png"} 
              alt="Portal Barcarena" 
              className={`object-contain ${
                collapsed ? "h-8 w-auto mx-auto" : "h-10 w-auto"
              }`}
            />
          </Link>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center flex-shrink-0"
              aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-primary-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-primary-foreground" />
              )}
            </button>
          )}
        </div>
        {!collapsed && (
          <p className="text-xs sm:text-sm text-primary-foreground/60 mt-1">Painel Admin</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <SidebarLink key={item.path} item={item} isActive={isActive} />
          );
        })}
        {/* Menu de Desenvolvimento - apenas para devs */}
        {isDev && devMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <SidebarLink key={item.path} item={item} isActive={isActive} />
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/login"
                  onClick={handleLinkClick}
                  className="admin-sidebar-link text-primary-foreground/70 hover:text-primary-foreground justify-center px-2"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link
            to="/admin/login"
            onClick={handleLinkClick}
            className="admin-sidebar-link text-primary-foreground/70 hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Sair</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
