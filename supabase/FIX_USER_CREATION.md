# Correção de Criação de Usuários

Este documento explica como corrigir o problema onde usuários são criados no Supabase Authentication mas não aparecem na tabela `profiles` e não podem fazer login.

## Problema

Quando um admin tenta criar um novo usuário (especialmente com role "dev"), o seguinte acontece:
1. O usuário é criado no Supabase Authentication
2. Mas o perfil não é criado na tabela `profiles` devido a políticas RLS
3. O usuário não aparece no admin
4. O usuário não consegue fazer login

## Solução

Execute os seguintes scripts SQL no Supabase SQL Editor na ordem indicada:

### 1. Corrigir Políticas RLS

Execute o script `fix_profiles_policies.sql`:

```sql
-- Este script atualiza as políticas RLS para incluir o role 'dev'
-- e garante que admins e devs possam criar, atualizar e deletar perfis
```

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `supabase/fix_profiles_policies.sql`
4. Clique em "Run"

### 2. Corrigir Usuários Órfãos

Execute o script `fix_orphan_users.sql` para criar perfis para usuários que já existem no auth mas não têm perfil:

```sql
-- Este script cria perfis para usuários órfãos
-- (usuários que existem no auth.users mas não têm perfil em profiles)
```

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `supabase/fix_orphan_users.sql`
4. Clique em "Run"

### 3. Verificar Resultado

Após executar os scripts, verifique:

1. **Verificar políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   Você deve ver as políticas:
   - "Admins e Devs podem criar perfis"
   - "Admins e Devs podem atualizar qualquer perfil"
   - "Admins e Devs podem deletar perfis"

2. **Verificar usuários órfãos:**
   ```sql
   SELECT au.id, au.email, p.id as profile_id
   FROM auth.users au
   LEFT JOIN public.profiles p ON au.id = p.id
   WHERE p.id IS NULL;
   ```
   Esta query não deve retornar nenhum resultado (ou apenas usuários que você quer manter sem perfil).

3. **Testar criação de usuário:**
   - Tente criar um novo usuário no admin
   - Verifique se o perfil é criado corretamente na tabela `profiles`
   - Verifique se o usuário aparece na lista de usuários do admin

## Melhorias no Código

O código em `src/services/users.ts` foi melhorado para:
- Tentar várias vezes verificar se o perfil foi criado pelo trigger
- Aguardar mais tempo entre tentativas
- Tratar melhor erros de duplicação
- Fornecer mensagens de erro mais claras

## Notas Importantes

- As políticas RLS agora incluem o role 'dev' além de 'admin'
- O trigger `handle_new_user` foi atualizado para usar `ON CONFLICT DO UPDATE` em vez de `DO NOTHING`
- O código agora tenta criar o perfil manualmente se o trigger falhar

## Se o Problema Persistir

1. Verifique se você está logado como admin ou dev
2. Verifique se as políticas RLS foram aplicadas corretamente
3. Verifique os logs do Supabase para erros específicos
4. Tente criar o usuário novamente após executar os scripts
