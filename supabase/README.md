# Setup do Banco de Dados Supabase

## Passos para configurar o banco de dados

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `schema.sql`
6. Clique em **Run** para executar

## O que o schema cria:

### Tabelas:
- **profiles** - Perfis de usuários (extendendo auth.users)
- **categories** - Categorias de notícias
- **posts** - Posts/Notícias
- **comments** - Comentários dos posts
- **ads** - Anúncios publicitários

### Segurança:
- **Row Level Security (RLS)** habilitado em todas as tabelas
- Políticas de acesso configuradas:
  - Posts publicados: visíveis para todos
  - Criação de posts: apenas editores e admins
  - Comentários: qualquer um pode criar, apenas aprovados são visíveis
  - Anúncios: apenas ativos são visíveis

### Funcionalidades:
- Triggers para atualizar `updated_at` automaticamente
- Índices para melhor performance
- Categorias padrão inseridas automaticamente

## Criar primeiro usuário admin

Após criar as tabelas, você precisa criar um usuário admin:

1. Vá em **Authentication** > **Users** no Supabase
2. Clique em **Add User** > **Create new user**
3. Crie um usuário com email e senha
4. Copie o **User UID**
5. Execute este SQL no SQL Editor:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '1546d56c-5cbc-4393-8015-38a0e24021da';
```

Ou se o perfil ainda não existir:

```sql
INSERT INTO public.profiles (id, name, email, role)
VALUES ('SEU_USER_UID_AQUI', 'Admin', 'seu-email@exemplo.com', 'admin');
```

## Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:

```
VITE_SUPABASE_URL=https://wacehnncowznzuxiuhdi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TjaIW9GvJN5BFMeX41HiyQ_d5ApAhGr
```
