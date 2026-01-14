# Deploy na Vercel - N91 Portal de Notícias

Este guia explica como fazer o deploy do projeto N91 na Vercel.

## Pré-requisitos

- Conta no GitHub (com o repositório já configurado)
- Conta na Vercel (gratuita)
- Conta no Supabase configurada
- Chaves de API (Gemini, OpenWeatherMap - opcionais)

## Passo a Passo

### 1. Conectar Repositório na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New..." → "Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório `n91-noticias`
5. Clique em "Import"

### 2. Configurar o Projeto

A Vercel detectará automaticamente que é um projeto Vite. As configurações padrão devem funcionar:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

Na página de configuração do projeto, vá em **"Environment Variables"** e adicione:

#### Obrigatórias (para o site funcionar):
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_do_supabase
```

#### Opcionais (para funcionalidades específicas):
```
VITE_GEMINI_API_KEY=sua_chave_do_google_gemini
# Necessária para automação de posts com IA (reescrita de conteúdo)

VITE_NEWS_API_KEY=sua_chave_do_newsapi
# Necessária para buscar notícias reais da NewsAPI (recomendado)
# Chave padrão: 0cc2192d2a4f46569780459d9b2d8d9a (já configurada no código)

VITE_WEATHER_API_KEY=sua_chave_do_openweathermap
# Necessária para página de clima funcionar
```

**Importante**: 
- Adicione essas variáveis para os ambientes: **Production**, **Preview** e **Development**
- Não compartilhe essas chaves publicamente
- Você pode encontrar as chaves do Supabase em: Settings → API
- Para Gemini: https://makersuite.google.com/app/apikey
- Para OpenWeatherMap: https://openweathermap.org/api

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Seu site estará disponível em uma URL como: `https://n91-noticias.vercel.app`

### 5. Configurar Domínio Personalizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar os DNS

## Estrutura de Arquivos

O arquivo `vercel.json` já está configurado com:
- Build command correto
- Output directory (`dist`)
- Rewrites para SPA (Single Page Application)

## Troubleshooting

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs de build na Vercel para mais detalhes

### Erro 404 em rotas
- O arquivo `vercel.json` já está configurado com rewrites para SPA
- Se ainda houver problemas, verifique se o arquivo está na raiz do projeto

### Variáveis de ambiente não funcionam
- Certifique-se de que as variáveis começam com `VITE_`
- Faça um novo deploy após adicionar variáveis
- Verifique se adicionou para todos os ambientes (Production, Preview, Development)

## Atualizações Futuras

Após o primeiro deploy, qualquer push para a branch `main` no GitHub irá:
- Disparar um novo deploy automaticamente
- Criar um preview para Pull Requests

## Suporte

Para mais informações sobre deploy na Vercel:
- [Documentação Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
