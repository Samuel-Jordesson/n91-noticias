# Como Desativar Confirmação de Email no Supabase

Para que os usuários criados pelo admin tenham o email confirmado automaticamente, siga estes passos:

## Passos:

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** (no menu lateral)
3. Clique em **Settings** (Configurações)
4. Na seção **Email Auth**, encontre a opção **"Enable email confirmations"**
5. **Desative** essa opção (toggle OFF)
6. Salve as alterações

## Resultado:

Após desativar, todos os usuários criados via `signUp` terão o email confirmado automaticamente, sem necessidade de verificação por email.

## Nota de Segurança:

Se você quiser manter a confirmação de email para usuários que se registram normalmente, mas não para usuários criados por admins, você precisará:
- Criar uma Edge Function no Supabase que use a API Admin (service_role) para criar usuários já confirmados
- Ou criar um endpoint backend que faça isso

Para a maioria dos casos, desativar a confirmação de email é a solução mais simples.
