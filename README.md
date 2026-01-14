# N91 - Portal de Notícias

Portal de notícias completo desenvolvido com React, TypeScript e Supabase.

## Tecnologias Utilizadas

Este projeto foi construído com:

- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **React** - Biblioteca UI
- **React Router** - Roteamento
- **shadcn-ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Supabase** - Backend (Banco de dados e autenticação)
- **TanStack Query** - Gerenciamento de estado e cache
- **Google Gemini API** - IA para análise e criação de conteúdo

## Funcionalidades

- 📰 Sistema completo de posts e notícias
- 🔐 Autenticação e autorização de usuários
- 🤖 Automação de posts com IA
- 💬 Sistema de comentários
- 📊 Dashboard administrativo
- 📱 Design responsivo
- 🔍 SEO otimizado
- 📈 Analytics e visualizações

## Como executar localmente

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Chave da API do Google Gemini (opcional, para automação)

### Instalação

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd n91-news-hub

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com:
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_GEMINI_API_KEY=sua_chave_gemini (opcional)
VITE_WEATHER_API_KEY=sua_chave_openweathermap (opcional)
```

### Executar em desenvolvimento

```sh
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`

### Build para produção

```sh
npm run build
```

Os arquivos de produção estarão na pasta `dist/`

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── layouts/        # Layouts principais
├── hooks/          # React hooks customizados
├── services/       # Serviços e integrações
├── integrations/   # Integrações (Supabase, etc)
├── types/          # Tipos TypeScript
└── utils/          # Funções utilitárias
```

## Configuração do Supabase

Consulte o arquivo `SETUP_SUPABASE.md` para instruções detalhadas sobre a configuração do banco de dados.

## Licença

Este projeto é privado e proprietário.
