import { useState } from 'react';
import { Plus, BookHeart, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useDevotionals, useDeleteDevotional } from '../../features/devotionals/hooks/useDevotionals';
import { DevotionalDialog } from '../../features/devotionals/components/DevotionalDialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingState';
import type { Devotional } from '../../services/devotionals';

export function DevotionalsPage() {
    const tenant = useAuthTenant();
    const { data: devotionals, isLoading } = useDevotionals(tenant?.id);
    const deleteDevotional = useDeleteDevotional(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null);
    const [deletingDevotional, setDeletingDevotional] = useState<Devotional | null>(null);

    const handleDelete = () => {
        if (deletingDevotional) {
            deleteDevotional.mutate(deletingDevotional.id);
            setDeletingDevotional(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    const isToday = (dateStr: string) => {
        return dateStr === new Date().toISOString().split('T')[0];
    };

    if (!tenant) {
        return (
            <EmptyState
                icon={BookHeart}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja."
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={BookHeart}
                iconColor="red"
                title="Devocionais"
                description={`Gerencie os devocionais diários da ${tenant.name}`}
                actions={
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus size={16} /> Novo Devocional
                    </Button>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
            ) : !devotionals?.length ? (
                <EmptyState
                    icon={BookHeart}
                    title="Nenhum devocional"
                    description="Crie o primeiro devocional para os membros da sua igreja."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devotionals.map((devotional) => (
                        <Card key={devotional.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                            <Calendar size={18} />
                                        </div>
                                        {isToday(devotional.date) && (
                                            <Badge className="bg-green-100 text-green-700 border-0">Hoje</Badge>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingDevotional(devotional)}>
                                                <Pencil size={14} className="mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeletingDevotional(devotional)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-xs text-gray-500 capitalize mb-1">
                                    {formatDate(devotional.date)}
                                </p>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    {devotional.title}
                                </h3>
                                <p className="text-sm text-indigo-600 font-medium mb-2">
                                    {devotional.verse_reference}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                    {devotional.meditation}
                                </p>
                                {devotional.author && (
                                    <p className="text-xs text-gray-400 mt-3">
                                        Por {devotional.author}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <DevotionalDialog
                isOpen={isDialogOpen || !!editingDevotional}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingDevotional(null);
                }}
                tenantId={tenant.id}
                devotional={editingDevotional}
            />

            <AlertDialog open={!!deletingDevotional} onOpenChange={() => setDeletingDevotional(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir devocional?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{deletingDevotional?.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
