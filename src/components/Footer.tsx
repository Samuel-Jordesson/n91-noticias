import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";
import { normalizeSlug } from "@/lib/utils";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-serif font-black mb-4">N91</h2>
            </Link>
            <p className="text-primary-foreground/80 max-w-md">
              O portal de notícias mais completo do Brasil. Informação de qualidade, 
              24 horas por dia, 7 dias por semana.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorias</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    to={`/categoria/${normalizeSlug(category)}`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60 text-sm">
          <p>© {new Date().getFullYear()} N91. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
