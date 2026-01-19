import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Database, Terminal, FileCode, GitBranch, Bug } from "lucide-react";

const AdminDevelopment = () => {
  return (
    <AdminLayout title="Desenvolvimento">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Área de Desenvolvimento</h1>
          <p className="text-muted-foreground">
            Ferramentas e informações exclusivas para desenvolvedores
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Database Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Banco de Dados</CardTitle>
                  <CardDescription>Informações do Supabase</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">Supabase</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">API Endpoints</CardTitle>
                  <CardDescription>Endpoints disponíveis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">REST API:</span>
                  <span className="font-medium">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GraphQL:</span>
                  <span className="font-medium text-muted-foreground">Não disponível</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Repository */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Repositório</CardTitle>
                  <CardDescription>Controle de versão</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Git:</span>
                  <span className="font-medium">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">main</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Tools */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bug className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ferramentas de Debug</CardTitle>
                  <CardDescription>Utilitários de desenvolvimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Console do navegador disponível</p>
                <p>React DevTools habilitado</p>
              </div>
            </CardContent>
          </Card>

          {/* Environment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ambiente</CardTitle>
                  <CardDescription>Configurações do sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modo:</span>
                  <span className="font-medium">
                    {import.meta.env.MODE === 'development' ? 'Desenvolvimento' : 'Produção'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Node:</span>
                  <span className="font-medium">v18+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  <CardDescription>Ferramentas úteis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Limpar cache</p>
                <p>• Recarregar dados</p>
                <p>• Ver logs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Detalhes técnicos da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Stack Tecnológico</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• React + TypeScript</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• Supabase</li>
                  <li>• React Query</li>
                  <li>• React Router</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recursos</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Editor de texto rico (TipTap)</li>
                  <li>• Sistema de autenticação</li>
                  <li>• Gerenciamento de posts</li>
                  <li>• Sistema de comentários</li>
                  <li>• Upload de imagens</li>
                  <li>• Dashboard administrativo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDevelopment;
