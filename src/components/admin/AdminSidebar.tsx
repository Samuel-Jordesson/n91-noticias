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
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FileText, label: "Posts", path: "/admin/posts" },
  { icon: Briefcase, label: "Empregos", path: "/admin/empregos" },
  { icon: MessageSquare, label: "Comentários", path: "/admin/comments" },
  { icon: Megaphone, label: "Anúncios", path: "/admin/ads" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Bot, label: "Automação IA", path: "/admin/automation" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="admin-sidebar flex flex-col h-full w-64 lg:w-72 overflow-hidden">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <Link to="/" className="inline-block" onClick={handleLinkClick}>
          <h1 className="text-xl sm:text-2xl font-serif font-black">N91</h1>
        </Link>
        <p className="text-xs sm:text-sm text-primary-foreground/60 mt-1">Painel Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`admin-sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/admin/login"
          onClick={handleLinkClick}
          className="admin-sidebar-link text-primary-foreground/70 hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Sair</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
