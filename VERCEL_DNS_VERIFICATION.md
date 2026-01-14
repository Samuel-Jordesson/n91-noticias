# Como Adicionar Registro TXT na Vercel para Verificação do Google

## 🔍 Situação Atual

Seu domínio `n91.com.br` está usando os nameservers da Vercel:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

Isso significa que **todos os registros DNS devem ser gerenciados no painel da Vercel**, não na Hostinger.

## 📋 Informações da Verificação

**Domínio**: `n91.com.br`  
**Tipo de Registro**: TXT  
**Valor do Registro**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`

## 🚀 Passo a Passo na Vercel

### 1. Acessar o Painel da Vercel

1. Acesse: https://vercel.com
2. Faça login na sua conta
3. Vá em **Dashboard**

### 2. Encontrar o Domínio

1. No menu lateral, clique em **Settings** (Configurações)
2. Clique em **Domains** (Domínios)
3. Procure por `n91.com.br` na lista de domínios
4. Clique no domínio `n91.com.br`

### 3. Adicionar Registro TXT

1. Na página do domínio, procure pela seção **DNS Records** ou **Registros DNS**
2. Clique em **Add Record** ou **Adicionar Registro**
3. Configure o registro:
   - **Type/Tipo**: Selecione `TXT`
   - **Name/Nome**: Deixe em branco ou coloque `@` (para o domínio raiz)
   - **Value/Valor**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: Deixe o padrão (geralmente 3600)
4. Clique em **Save** ou **Salvar**

### 4. Aguardar Propagação

- **Tempo mínimo**: 5-15 minutos
- **Tempo médio**: 1-4 horas
- **Tempo máximo**: 24-48 horas

## ✅ Verificar se Funcionou

### Opção 1: Terminal/CMD

No Windows (PowerShell):
```bash
nslookup -type=TXT n91.com.br
```

No Linux/Mac:
```bash
dig TXT n91.com.br
```

Você deve ver o registro `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ` na resposta.

### Opção 2: Ferramenta Online

1. Acesse: https://mxtoolbox.com/TXTLookup.aspx
2. Digite: `n91.com.br`
3. Clique em **TXT Lookup**
4. Verifique se o registro aparece na lista

### Opção 3: No Google Search Console

1. Após adicionar o registro, aguarde alguns minutos
2. Volte ao Google Search Console
3. Clique em **VERIFICAR**
4. Se funcionar, você verá uma mensagem de sucesso ✅

## 🔧 Se Não Encontrar a Opção de DNS na Vercel

A Vercel pode ter mudado a interface. Tente estas alternativas:

### Alternativa 1: Verificar se o domínio está configurado corretamente

1. Vá em **Settings** → **Domains**
2. Verifique se `n91.com.br` está listado
3. Se não estiver, você precisa adicionar o domínio primeiro

### Alternativa 2: Usar a API da Vercel

Se a interface não tiver a opção, você pode usar a API da Vercel:

1. Acesse: https://vercel.com/account/tokens
2. Crie um token de API
3. Use a API para adicionar o registro (mais técnico)

### Alternativa 3: Mudar Nameservers para Hostinger

Se preferir gerenciar DNS na Hostinger:

1. Na Hostinger, vá em **DNS / Nameservers**
2. Clique em **Alterar nameservers**
3. Altere para os nameservers da Hostinger
4. Aguarde a propagação (pode levar até 48 horas)
5. Depois, adicione o registro TXT na Hostinger

⚠️ **Atenção**: Mudar nameservers pode afetar o funcionamento do site na Vercel temporariamente.

## 📝 Notas Importantes

- ✅ O registro TXT não afeta o funcionamento do site
- ✅ Você pode ter múltiplos registros TXT no mesmo domínio
- ✅ Não remova o registro após a verificação (o Google pode verificar novamente)
- ⏱️ Aguarde a propagação antes de tentar verificar no Google

## 🆘 Precisa de Ajuda?

Se você não conseguir encontrar a opção de DNS na Vercel:

1. **Verifique a documentação da Vercel**: https://vercel.com/docs/concepts/projects/domains/add-a-domain#dns-records
2. **Entre em contato com o suporte da Vercel**: https://vercel.com/support
3. **Use uma ferramenta de verificação alternativa no Google Search Console**:
   - No modal de verificação, clique em "Não pode fazer a verificação por meio do provedor do nome de domínio?"
   - Escolha "use uma propriedade de prefixo de URL"
   - Isso permite verificar usando um arquivo HTML ou meta tag

## 🎯 Método Alternativo: Verificação por Arquivo HTML

Se não conseguir adicionar o registro TXT, você pode usar o método de arquivo HTML:

1. No Google Search Console, escolha "Verificar por arquivo HTML"
2. Baixe o arquivo de verificação
3. Adicione o arquivo na pasta `public/` do seu projeto
4. Faça commit e push
5. Aguarde o deploy na Vercel
6. Volte ao Google Search Console e clique em "VERIFICAR"

Este método é mais simples e não requer acesso ao DNS!
