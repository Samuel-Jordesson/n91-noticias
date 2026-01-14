import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const siteUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://n91.com.br');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar últimos 50 posts publicados
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        excerpt,
        content,
        image_url,
        published_at,
        created_at,
        categories:category_id (name, slug),
        profiles:author_id (name)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50);

    if (postsError) throw postsError;

    // Função para gerar slug
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 100);
    };

    // Função para limpar HTML e criar descrição
    const stripHtml = (html: string): string => {
      return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .substring(0, 500);
    };

    // Gerar itens RSS
    const items = (posts || []).map((post: any) => {
      const slug = generateSlug(post.title);
      const pubDate = post.published_at 
        ? new Date(post.published_at).toUTCString()
        : new Date(post.created_at).toUTCString();
      const description = post.excerpt || stripHtml(post.content || '');
      const imageUrl = post.image_url 
        ? (post.image_url.startsWith('http') ? post.image_url : `${siteUrl}${post.image_url}`)
        : '';
      const category = post.categories?.name || 'Geral';
      const author = post.profiles?.name || 'N91';
      const link = `${siteUrl}/noticia/${slug}`;

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ''}
      <category><![CDATA[${category}]]></category>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('\n');

    // Gerar RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>N91 - Portal de Notícias</title>
    <link>${siteUrl}</link>
    <description>N91 - O portal de notícias mais completo do Brasil. Notícias atualizadas 24 horas sobre economia, política, esportes, tecnologia e muito mais.</description>
    <language>pt-BR</language>
    <copyright>Copyright © ${new Date().getFullYear()} N91</copyright>
    <managingEditor>editor@n91.com.br</managingEditor>
    <webMaster>webmaster@n91.com.br</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>N91 - Portal de Notícias</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).send(rss);
  } catch (error: any) {
    console.error('Erro ao gerar RSS:', error);
    res.status(500).json({ error: 'Erro ao gerar RSS feed' });
  }
}
