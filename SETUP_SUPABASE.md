# 🚀 Setup Completo do Sistema com Supabase

## ✅ O que foi criado:

### 1. **Schema do Banco de Dados** (`supabase/schema.sql`)
- ✅ Tabelas: profiles, categories, posts, comments, ads
- ✅ Row Level Security (RLS) configurado
- ✅ Políticas de acesso por role
- ✅ Triggers automáticos
- ✅ Índices para performance
- ✅ Categorias padrão

### 2. **Serviços** (`src/services/`)
- ✅ `posts.ts` - CRUD de posts
- ✅ `comments.ts` - Sistema de comentários
- ✅ `ads.ts` - Gerenciamento de anúncios
- ✅ `auth.ts` - Autenticação e perfis
- ✅ `categories.ts` - Categorias

### 3. **Hooks React Query** (`src/hooks/`)
- ✅ `usePosts.ts` - Hooks para posts
- ✅ `useComments.ts` - Hooks para comentários
- ✅ `useAds.ts` - Hooks para anúncios
- ✅ `useAuth.ts` - Hooks de autenticação
- ✅ `useCategories.ts` - Hooks para categorias

### 4. **Páginas Atualizadas**
- ✅ `AdminLogin.tsx` - Login real com Supabase

## 📋 Próximos Passos:

### 1. Executar o SQL no Supabase
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** > **New Query**
4. Copie todo o conteúdo de `supabase/schema.sql`
5. Execute (Run)

### 2. Criar Primeiro Usuário Admin
1. Vá em **Authentication** > **Users** > **Add User**
2. Crie um usuário com email e senha
3. Copie o **User UID**
4. Execute no SQL Editor:

```sql
INSERT INTO public.profiles (id, name, email, role)
VALUES ('SEU_USER_UID', 'Admin', 'seu-email@exemplo.com', 'admin');
```

### 3. Verificar Variáveis de Ambiente
Certifique-se que o `.env` tem:
```
VITE_SUPABASE_URL=https://wacehnncowznzuxiuhdi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TjaIW9GvJN5BFMeX41HiyQ_d5ApAhGr
```

### 4. Reiniciar o Servidor
```bash
npm run dev
```

## 🔄 O que ainda precisa ser atualizado:

1. **Página Inicial** (`src/pages/Index.tsx`) - Usar `usePosts()` ao invés de mockData
2. **Página de Artigo** (`src/pages/ArticlePage.tsx`) - Usar dados reais
3. **AdminPosts** - CRUD completo
4. **AdminAds** - CRUD completo
5. **AdminComments** - Moderação real
6. **CommentSection** - Comentários reais
7. **Proteção de Rotas** - Middleware para admin

## 🎯 Status Atual:

- ✅ Schema SQL criado
- ✅ Serviços criados
- ✅ Hooks criados
- ✅ Login funcionando
- ⏳ Páginas públicas (pendente)
- ⏳ Admin CRUD (pendente)
- ⏳ Proteção de rotas (pendente)
