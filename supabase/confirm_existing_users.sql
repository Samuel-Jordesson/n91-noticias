-- Script para confirmar emails de usuários existentes
-- Execute este SQL no Supabase SQL Editor para confirmar todos os emails de uma vez

-- ATENÇÃO: Este script atualiza diretamente a tabela auth.users
-- Use apenas se você desativou a confirmação de email e quer confirmar usuários existentes

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Verificar quantos usuários foram atualizados
SELECT 
  COUNT(*) as usuarios_confirmados
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;
