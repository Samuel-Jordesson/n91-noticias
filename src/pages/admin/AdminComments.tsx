import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllComments, useModerateComment, useDeleteComment } from "@/hooks/useComments";
import { usePost } from "@/hooks/usePosts";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { generateSlug } from "@/lib/utils";

const AdminComments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: commentsData, isLoading } = useAllComments();
  const moderateMutation = useModerateComment();
  const deleteMutation = useDeleteComment();

  const comments = commentsData || [];

  const filteredComments = comments.filter((comment: any) => {
    const matchesSearch = 
      comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getArticleTitle = (postData: any) => {
    if (typeof postData === 'object' && postData?.title) {
      return postData.title;
    }
    return "Artigo não encontrado";
  };

  const handleApprove = async (id: string) => {
    try {
      await moderateMutation.mutateAsync({ id, isApproved: true });
      toast.success("Comentário aprovado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao aprovar comentário");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await moderateMutation.mutateAsync({ id, isApproved: false });
      toast.success("Comentário rejeitado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao rejeitar comentário");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Comentário excluído!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir comentário");
    }
  };

  return (
    <AdminLayout title="Gerenciar Comentários">
      {/* Search */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar comentários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Comments List */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">Comentários ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {filteredComments.map((comment: any) => {
                const postData = comment.posts;
                const isApproved = comment.is_approved;
                
                return (
                  <div
                    key={comment.id}
                    className={`p-2 sm:p-3 md:p-4 rounded-lg border ${
                      isApproved 
                        ? "bg-muted/50 border-border" 
                        : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-semibold flex-shrink-0">
                            {comment.author_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="font-medium text-xs sm:text-sm truncate">{comment.author_name || "Anônimo"}</span>
                              {comment.author_email && (
                                <span className="text-muted-foreground text-[10px] sm:text-xs hidden sm:inline">
                                  ({comment.author_email})
                                </span>
                              )}
                              <span className="text-muted-foreground text-[10px] sm:text-xs">
                                {formatDistanceToNow(new Date(comment.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                              {!isApproved && (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-[10px] sm:text-xs font-medium rounded">
                                  Pendente
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 mb-1.5 sm:mb-2 whitespace-pre-wrap break-words">{comment.content}</p>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground flex-wrap">
                          <span className="min-w-0">
                            <span className="font-medium">Artigo:</span>{" "}
                            {postData ? (
                              <Link 
                                to={`/noticia/${generateSlug(postData.title)}`}
                                className="text-primary hover:underline truncate block"
                              >
                                {getArticleTitle(postData)}
                              </Link>
                            ) : (
                              <span className="truncate block">{getArticleTitle(postData)}</span>
                            )}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            <span className="font-medium">Likes:</span> {comment.likes || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        {!isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-600 hover:bg-green-50 h-7 w-7 sm:h-9 sm:w-9"
                            onClick={() => handleApprove(comment.id)}
                            disabled={moderateMutation.isPending}
                            title="Aprovar comentário"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-600 hover:text-orange-600 hover:bg-orange-50 h-7 w-7 sm:h-9 sm:w-9"
                            onClick={() => handleReject(comment.id)}
                            disabled={moderateMutation.isPending}
                            title="Rejeitar comentário"
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-7 w-7 sm:h-9 sm:w-9"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteMutation.isPending}
                          title="Excluir comentário"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredComments.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "Nenhum comentário encontrado com esse termo." : "Nenhum comentário encontrado."}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminComments;
