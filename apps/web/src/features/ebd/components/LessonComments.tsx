import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ebdService } from '../../../services/ebd';
import { Button } from '../../../components/ui/button';
import type { Member } from '../../../types';

interface Props {
    lessonId: string;
    tenantId: string;
    currentMemberId?: string;
    members: Member[];
    canDelete?: boolean;
}

export function LessonComments({ lessonId, tenantId, currentMemberId, members, canDelete }: Props) {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');

    const { data: comments, isLoading } = useQuery({
        queryKey: ['ebd-comments', lessonId],
        queryFn: () => ebdService.listComments(lessonId, tenantId),
        enabled: !!lessonId && !!tenantId,
    });

    const createMutation = useMutation({
        mutationFn: (content: string) => ebdService.createComment(lessonId, tenantId, {
            lesson_id: lessonId,
            member_id: currentMemberId!,
            content,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-comments', lessonId] });
            setNewComment('');
            toast.success('Comentário adicionado!');
        },
        onError: () => {
            toast.error('Erro ao adicionar comentário.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (commentId: string) => ebdService.deleteComment(lessonId, commentId, tenantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-comments', lessonId] });
            toast.success('Comentário removido!');
        },
        onError: () => {
            toast.error('Erro ao remover comentário.');
        }
    });

    const getMemberName = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return member?.full_name || 'Membro';
    };

    const getMemberInitial = (memberId: string) => {
        const name = getMemberName(memberId);
        return name.charAt(0).toUpperCase();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentMemberId) return;
        createMutation.mutate(newComment.trim());
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle size={16} aria-hidden="true" />
                Comentários ({comments?.length || 0})
            </h4>

            {/* Comment Form */}
            {currentMemberId && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <label htmlFor="lesson-comment-input" className="sr-only">
                        Escreva um comentário
                    </label>
                    <input
                        id="lesson-comment-input"
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        maxLength={1000}
                        aria-label="Escreva um comentário"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || createMutation.isPending}
                        className="gap-1"
                        aria-label="Enviar comentário"
                    >
                        <Send size={14} aria-hidden="true" />
                    </Button>
                </form>
            )}

            {/* Comments List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : !comments?.length ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                    Nenhum comentário ainda. Seja o primeiro!
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm flex-shrink-0">
                                {getMemberInitial(comment.member_id)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900">
                                        {getMemberName(comment.member_id)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5 break-words">
                                    {comment.content}
                                </p>
                            </div>
                            {canDelete && (
                                <button
                                    onClick={() => deleteMutation.mutate(comment.id)}
                                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remover comentário"
                                    aria-label={`Remover comentário de ${getMemberName(comment.member_id)}`}
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
