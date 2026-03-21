import { useState } from 'react';
import { MapPin, Globe, Mail, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { CardSkeleton } from "../../../components/LoadingState";
import { EmptyState } from "../../../components/EmptyState";
import { LazyImage } from '../../../components/ui/LazyImage';
import type { Missionary } from '../../../services/missions';

interface MissionaryListProps {
    missionaries?: Missionary[];
    isLoading?: boolean;
    onEdit?: (missionary: Missionary) => void;
    onDelete?: (missionaryId: string) => void;
}

export function MissionaryList({ missionaries, isLoading, onEdit, onDelete }: MissionaryListProps) {
    const [missionaryToDelete, setMissionaryToDelete] = useState<Missionary | null>(null);

    const handleDeleteConfirm = () => {
        if (missionaryToDelete && onDelete) {
            onDelete(missionaryToDelete.id);
        }
        setMissionaryToDelete(null);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!missionaries || missionaries.length === 0) {
        return (
            <EmptyState
                icon={Globe}
                title="Nenhum missionário"
                description="Cadastre os missionários e projetos que sua igreja apoia."
            />
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missionaries.map((m) => (
                    <Card key={m.id} className="hover:shadow-md transition-shadow overflow-hidden group relative">
                        <div className="h-32 bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            {m.photo_url ? (
                                <LazyImage
                                    src={m.photo_url}
                                    alt={m.name}
                                    className="h-full w-full object-cover"
                                    fallbackSrc="/logo.svg"
                                />
                            ) : (
                                <Globe size={48} className="text-indigo-200 group-hover:text-indigo-300" />
                            )}
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <CardTitle className="text-lg">{m.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {m.country_code}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                aria-label={`Abrir ações para ${m.name}`}
                                                title={`Abrir ações para ${m.name}`}
                                            >
                                                <MoreVertical size={16} aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit?.(m)}>
                                                <Pencil size={14} className="mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setMissionaryToDelete(m)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                                <MapPin size={16} aria-hidden="true" />
                                {m.city && m.state ? `${m.city}, ${m.state}` : m.field_name}
                            </div>

                            <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">
                                {m.field_name}
                            </p>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[60px]">
                                {m.bio || "Sem biografia."}
                            </p>

                            {m.newsletter_url && (
                                <a
                                    href={m.newsletter_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-2" })}
                                >
                                    <Mail size={16} aria-hidden="true" /> Ver Newsletter
                                </a>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!missionaryToDelete} onOpenChange={() => setMissionaryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir missionário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{missionaryToDelete?.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
