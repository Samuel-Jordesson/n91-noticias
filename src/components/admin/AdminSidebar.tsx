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
  Code,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProfile } from "@/hooks/useAuth";

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
  const { data: profile } = useProfile();
  const isDev = profile?.role === 'dev';

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const NavItem = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => {
    const linkContent = (
      <Link
        to={item.path}
        onClick={handleLinkClick}
        className={`
          flex items-center rounded-lg transition-all duration-200 group
          ${collapsed ? 'justify-center px-2 py-2 w-full' : 'justify-between w-full px-4 py-2'}
          ${isActive 
            ? 'bg-[#21366B]/5 text-[#21366B] font-semibold' 
            : 'text-slate-500 hover:text-[#21366B] hover:bg-slate-50'}
        `}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <item.icon 
            size={18} 
            strokeWidth={isActive ? 2.5 : 2} 
            className={`flex-shrink-0 ${isActive ? 'text-[#21366B]' : 'text-slate-400 group-hover:text-[#21366B]'}`} 
          />
          {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
        </div>
        {isActive && !collapsed && <div className="w-1.5 h-1.5 rounded-full bg-[#21366B] flex-shrink-0" />}
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

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: FileText, label: "Posts", path: "/admin/posts" },
    { icon: Briefcase, label: "Empregos", path: "/admin/empregos" },
    { icon: FolderTree, label: "Categorias", path: "/admin/categories" },
    { icon: MessageSquare, label: "Comentários", path: "/admin/comments" },
    { icon: Megaphone, label: "Anúncios", path: "/admin/ads" },
    { icon: Users, label: "Usuários", path: "/admin/users" },
  ];

  const resourceItems = [
    { icon: Bot, label: "Automação IA", path: "/admin/automation" },
    { icon: Settings, label: "Configurações", path: "/admin/settings" },
  ];

  return (
    <nav className={`bg-white flex flex-col border-r border-slate-100 shrink-0 transition-all duration-300 relative ${
      collapsed ? "w-16 p-4" : "w-64 p-6"
    }`}>
      {/* Logo */}
      <div className={`flex items-center mb-10 ${collapsed ? "justify-center mb-6" : "gap-3 px-2"}`}>
        {collapsed ? (
          <Link to="/" className="inline-block" onClick={handleLinkClick}>
            <img 
              src="/imagens/Portal_Barcarena_h.png" 
              alt="Portal Barcarena" 
              className="h-8 w-auto object-contain"
            />
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-3" onClick={handleLinkClick}>
            <img 
              src="/imagens/Portal_Barcarena_h.png" 
              alt="Portal Barcarena" 
              className="h-11 w-auto object-contain"
            />
          </Link>
        )}
      </div>

      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute top-6 right-2 p-1.5 rounded-lg hover:bg-slate-50 transition-all items-center justify-center text-slate-400 hover:text-slate-600 z-10"
          aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      )}

      {/* Navigation */}
      {!collapsed && (
        <>
          <div className="text-[10px] font-bold text-slate-300 px-4 mb-4 uppercase tracking-[0.15em]">Navegação</div>
          <div className="flex flex-col gap-1 mb-8">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem key={item.path} item={item} isActive={isActive} />
              );
            })}
          </div>

          <div className="text-[10px] font-bold text-slate-300 px-4 mb-4 uppercase tracking-[0.15em]">Recursos</div>
          <div className="flex flex-col gap-1 mb-8">
            {resourceItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem key={item.path} item={item} isActive={isActive} />
              );
            })}
            {isDev && devMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem key={item.path} item={item} isActive={isActive} />
              );
            })}
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavItem key={item.path} item={item} isActive={isActive} />
            );
          })}
          {resourceItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavItem key={item.path} item={item} isActive={isActive} />
            );
          })}
          {isDev && devMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavItem key={item.path} item={item} isActive={isActive} />
            );
          })}
        </div>
      )}

      {/* Logout */}
      {collapsed ? (
        <div className="mt-auto pt-4 border-t border-slate-100">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/login"
                  onClick={handleLinkClick}
                  className="flex items-center justify-center px-2 py-2 rounded-lg text-slate-500 hover:text-[#21366B] hover:bg-slate-50 transition-all"
                >
                  <LogOut size={18} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            to="/admin/login"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-[#21366B] hover:bg-slate-50 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default AdminSidebar;
