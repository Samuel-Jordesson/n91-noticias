import { useState, useEffect } from "react";
import { Comment } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { usePostComments, useCreateComment, useLikeComment } from "@/hooks/useComments";

interface CommentSectionProps {
  comments: Comment[];
  articleId: string;
}

const CommentSection = ({ comments: initialComments, articleId }: CommentSectionProps) => {
  const { data: commentsData, isLoading, refetch } = usePostComments(articleId);
  const createCommentMutation = useCreateComment();
  const likeCommentMutation = useLikeComment();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  // Atualizar comentários quando os dados do Supabase mudarem
  useEffect(() => {
    if (commentsData && commentsData.length > 0) {
      setComments(commentsData.map(comment => ({
        id: comment.id,
        articleId: comment.post_id,
        author: comment.author_name,
        content: comment.content,
        createdAt: new Date(comment.created_at),
        likes: comment.likes || 0,
      })));
    } else {
      setComments([]);
    }
  }, [commentsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        post_id: articleId,
        author_name: name.trim(),
        content: content.trim(),
        author_email: null,
        is_approved: true, // Aprovar automaticamente
      });
      
      setName("");
      setContent("");
      toast.success("Comentário publicado com sucesso!");
      // Aguardar um pouco antes de refetch para garantir que o comentário foi salvo
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao criar comentário:", error);
      toast.error(error.message || "Erro ao publicar comentário");
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeCommentMutation.mutateAsync(commentId);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao curtir comentário");
    }
  };

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h3 className="flex items-center gap-2 text-xl font-serif font-bold mb-6">
        <MessageCircle className="h-5 w-5" />
        Comentários ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-muted">
        <h4 className="font-semibold mb-4">Deixe seu comentário</h4>
        <div className="space-y-4">
          <Input
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-card"
          />
          <Textarea
            placeholder="Escreva seu comentário..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="bg-card resize-none"
          />
          <Button 
            type="submit" 
            disabled={createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? "Publicando..." : "Publicar Comentário"}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">
          Carregando comentários...
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <article key={comment.id} className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.author}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatDistanceToNow(comment.createdAt, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-foreground/90 mb-2 whitespace-pre-wrap">{comment.content}</p>
                  <button
                    onClick={() => handleLike(comment.id)}
                    disabled={likeCommentMutation.isPending}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {comment.likes}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {comments.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8">
              Seja o primeiro a comentar!
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default CommentSection;
