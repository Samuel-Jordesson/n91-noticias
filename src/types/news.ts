export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: string;
  publishedAt: Date;
  isBreaking?: boolean;
  views: number;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user' | 'dev';
  createdAt: Date;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: 'sidebar' | 'banner' | 'inline';
  isActive: boolean;
}
