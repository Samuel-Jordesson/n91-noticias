import { Link } from "react-router-dom";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { categories } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Função para normalizar slug (remover acentos)
const normalizeSlug = (slug: string): string => {
  return slug
    .toLowerCase()
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .trim();
};

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

  // Category links
  const getCategoryLink = (category: string) => {
    const normalized = normalizeSlug(category);
    switch (normalized) {
      case "esportes":
        return "/esportes";
      case "clima":
        return "/clima";
      default:
        return `/categoria/${normalized}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-2 text-sm">
          <span className="hidden sm:block">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {user && (
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="flex items-center gap-1 hover:underline">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Área Admin</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <nav className="flex flex-col gap-2 mt-8">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={getCategoryLink(category)}
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl md:text-4xl font-serif font-black text-primary tracking-tight">
              N91
            </h1>
          </Link>

          {/* Search */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative animate-slide-in">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Buscar notícias..."
                  className="w-48 md:w-64 pl-9 pr-4 h-9 bg-muted/50 border-border/50 focus:bg-background focus:border-border focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-9 w-9"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden lg:block border-t border-border bg-card">
        <div className="container">
          <ul className="flex items-center gap-1 py-2 overflow-x-auto">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  to={getCategoryLink(category)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
