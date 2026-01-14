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
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FileText, label: "Posts", path: "/admin/posts" },
  { icon: MessageSquare, label: "Comentários", path: "/admin/comments" },
  { icon: Megaphone, label: "Anúncios", path: "/admin/ads" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Bot, label: "Automação IA", path: "/admin/automation" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="inline-block">
          <h1 className="text-2xl font-serif font-black">N91</h1>
        </Link>
        <p className="text-sm text-primary-foreground/60 mt-1">Painel Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/admin/login"
          className="admin-sidebar-link text-primary-foreground/70 hover:text-primary-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
