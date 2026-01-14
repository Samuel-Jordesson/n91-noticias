# Como Verificar o Domínio no Google Search Console

## ⚠️ IMPORTANTE: Seu domínio usa Vercel DNS

Seu domínio `n91.com.br` está usando os nameservers da Vercel (`ns1.vercel-dns.com` e `ns2.vercel-dns.com`). 

**Você tem 2 opções:**

1. **Método DNS TXT** (veja `VERCEL_DNS_VERIFICATION.md` para instruções na Vercel)
2. **Método Arquivo HTML** (mais simples, recomendado) ⭐

## 📋 Informações da Verificação

**Domínio**: `n91.com.br`  
**Tipo de Registro**: TXT  
**Valor do Registro**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`

## 🎯 Método Recomendado: Arquivo HTML (Mais Simples)

Este método é mais fácil e não requer acesso ao DNS da Vercel!

### Passo a Passo:

1. No Google Search Console, no modal de verificação:
   - Clique em **"Não pode fazer a verificação por meio do provedor do nome de domínio?"**
   - Escolha **"use uma propriedade de prefixo de URL"**
   - Ou feche o modal e adicione uma nova propriedade escolhendo **"Prefixo de URL"** em vez de "Domínio"

2. Escolha o método **"Arquivo HTML"**

3. Baixe o arquivo de verificação (ex: `google1234567890abcdef.html`)

4. Coloque o arquivo na pasta `public/` do seu projeto

5. Faça commit e push:
   ```bash
   git add public/google*.html
   git commit -m "Adicionar arquivo de verificação do Google"
   git push origin main
   ```

6. Aguarde o deploy na Vercel (geralmente 1-2 minutos)

7. Volte ao Google Search Console e clique em **"VERIFICAR"**

✅ **Pronto!** Este método é muito mais simples e funciona imediatamente após o deploy.

## 🔧 Passo a Passo por Provedor

### 1. **GoDaddy**

1. Acesse: https://www.godaddy.com
2. Faça login na sua conta
3. Vá em **Meus Produtos** → **DNS** (ou **Gerenciar DNS**)
4. Encontre a seção **Registros DNS** ou **DNS Records**
5. Clique em **Adicionar** ou **+ Adicionar Registro**
6. Configure:
   - **Tipo**: `TXT`
   - **Nome/Host**: `@` ou deixe em branco (para o domínio raiz)
   - **Valor**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: `600` (ou deixe o padrão)
7. Clique em **Salvar**
8. Aguarde alguns minutos (pode levar até 24 horas)

### 2. **Namecheap**

1. Acesse: https://www.namecheap.com
2. Faça login na sua conta
3. Vá em **Domain List** → Clique em **Manage** ao lado de `n91.com.br`
4. Vá na aba **Advanced DNS**
5. Na seção **Host Records**, clique em **Add New Record**
6. Configure:
   - **Type**: `TXT Record`
   - **Host**: `@`
   - **Value**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: `Automatic` ou `600`
7. Clique no ícone de **checkmark** para salvar
8. Aguarde alguns minutos

### 3. **Cloudflare**

1. Acesse: https://dash.cloudflare.com
2. Faça login na sua conta
3. Selecione o domínio `n91.com.br`
4. Vá em **DNS** → **Records**
5. Clique em **Add record**
6. Configure:
   - **Type**: `TXT`
   - **Name**: `@` (ou deixe em branco)
   - **Content**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **Proxy status**: Desativado (nuvem cinza)
   - **TTL**: `Auto`
7. Clique em **Save**
8. Aguarde alguns minutos

### 4. **Registro.br (Registro de Domínios .br)**

1. Acesse: https://registro.br
2. Faça login na sua conta
3. Vá em **Meus Domínios** → Clique em `n91.com.br`
4. Vá em **DNS** ou **Zona DNS**
5. Clique em **Adicionar Registro**
6. Configure:
   - **Tipo**: `TXT`
   - **Nome**: `@` (ou deixe em branco para o domínio raiz)
   - **Valor**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: `3600` (ou deixe o padrão)
7. Clique em **Salvar** ou **Confirmar**
8. Aguarde alguns minutos

### 5. **Hostinger**

1. Acesse: https://www.hostinger.com.br
2. Faça login na sua conta
3. Vá em **Domínios** → Clique em `n91.com.br`
4. Vá em **DNS / Nameservers**
5. Na seção **DNS Records**, clique em **Adicionar Registro**
6. Configure:
   - **Tipo**: `TXT`
   - **Nome**: `@`
   - **Valor**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: `3600`
7. Clique em **Salvar**
8. Aguarde alguns minutos

### 6. **Outros Provedores**

Se você usa outro provedor (ex: AWS Route 53, Google Domains, etc.):

1. Acesse o painel de DNS do seu provedor
2. Procure por **DNS Records**, **Zone Records** ou **Registros DNS**
3. Adicione um novo registro:
   - **Tipo**: `TXT`
   - **Nome/Host**: `@` ou deixe em branco (para o domínio raiz)
   - **Valor/Conteúdo**: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - **TTL**: `600` ou `3600`
4. Salve o registro

## ⏱️ Tempo de Propagação

- **Mínimo**: 5-15 minutos
- **Médio**: 1-4 horas
- **Máximo**: 24-48 horas

## ✅ Como Verificar se Funcionou

### Opção 1: Usando Terminal/CMD

No Windows (PowerShell ou CMD):
```bash
nslookup -type=TXT n91.com.br
```

No Linux/Mac:
```bash
dig TXT n91.com.br
```

Você deve ver o registro `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ` na resposta.

### Opção 2: Ferramentas Online

1. Acesse: https://mxtoolbox.com/TXTLookup.aspx
2. Digite: `n91.com.br`
3. Clique em **TXT Lookup**
4. Verifique se o registro aparece na lista

### Opção 3: No Google Search Console

1. Após adicionar o registro DNS, volte ao Google Search Console
2. Clique em **VERIFICAR**
3. Se funcionar, você verá uma mensagem de sucesso
4. Se não funcionar, aguarde mais tempo e tente novamente

## 🔍 Troubleshooting

### O registro não aparece após algumas horas

1. **Verifique se o registro foi salvo corretamente**
   - Confirme que o tipo é `TXT` (não `A`, `CNAME`, etc.)
   - Confirme que o nome é `@` ou está vazio
   - Confirme que o valor está completo e correto

2. **Verifique se não há erros de digitação**
   - O valor deve ser exatamente: `google-site-verification=csTUJ1FAz7blJbdax7HTjEPSTiQkTqHC14iGSesCAwQ`
   - Sem espaços extras no início ou fim

3. **Aguarde mais tempo**
   - DNS pode levar até 48 horas para propagar completamente
   - Tente verificar novamente após algumas horas

4. **Limpe o cache DNS do seu computador**
   - Windows: `ipconfig /flushdns`
   - Mac/Linux: `sudo dscacheutil -flushcache`

### Erro: "Registro não encontrado"

- Aguarde mais tempo (pode levar até 24 horas)
- Verifique se o registro foi salvo corretamente no painel DNS
- Use ferramentas online para verificar se o registro está visível publicamente

## 📝 Notas Importantes

- ⚠️ **Não remova o registro após a verificação** - O Google pode verificar novamente no futuro
- ✅ Você pode ter múltiplos registros TXT no mesmo domínio
- 🔒 O registro TXT não afeta o funcionamento do site
- 📍 O registro deve ser adicionado no domínio raiz (`@`), não em subdomínios

## 🚀 Após a Verificação

Depois que o domínio for verificado:

1. **Adicione o Sitemap**
   - Vá em **Sitemaps** no Google Search Console
   - Adicione: `https://n91.com.br/sitemap.xml`
   - Clique em **Enviar**

2. **Configure o Google News Publisher Center**
   - Acesse: https://publishers.google.com/
   - Adicione o site `n91.com.br`
   - Configure as categorias e seções

3. **Monitore a Indexação**
   - Vá em **Cobertura** no Search Console
   - Acompanhe quantas páginas foram indexadas
   - Verifique se há erros

## 📞 Precisa de Ajuda?

Se você não souber qual é o seu provedor de DNS:

1. Acesse: https://whois.net
2. Digite: `n91.com.br`
3. Procure por **Name Servers** ou **Servidores de Nome**
4. Isso mostrará qual provedor está gerenciando o DNS
