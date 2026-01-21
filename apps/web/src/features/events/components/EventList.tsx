import { useState } from 'react';
import { Calendar, MapPin, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
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
import type { Event } from '../../../services/events';

interface EventListProps {
    events?: Event[];
    isLoading?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (eventId: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
    culto: { label: 'Culto', color: 'bg-purple-100 text-purple-700' },
    reuniao: { label: 'Reunião', color: 'bg-blue-100 text-blue-700' },
    evento_social: { label: 'Social', color: 'bg-green-100 text-green-700' },
    conferencia: { label: 'Conferência', color: 'bg-orange-100 text-orange-700' },
    estudo: { label: 'Estudo', color: 'bg-indigo-100 text-indigo-700' },
    oracao: { label: 'Oração', color: 'bg-pink-100 text-pink-700' },
    outro: { label: 'Outro', color: 'bg-gray-100 text-gray-700' },
};

export function EventList({ events, isLoading, onEdit, onDelete }: EventListProps) {
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const handleDeleteConfirm = () => {
        if (eventToDelete && onDelete) {
            onDelete(eventToDelete.id);
        }
        setEventToDelete(null);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <EmptyState
                icon={Calendar}
                title="Nenhum evento"
                description="Cadastre o primeiro evento da sua igreja."
            />
        );
    }

    // Sort by start_date
    const sortedEvents = [...events].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((event) => {
                    const categoryInfo = event.category ? CATEGORY_LABELS[event.category] : null;
                    const isPast = new Date(event.start_date) < new Date();

                    return (
                        <Card 
                            key={event.id} 
                            className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Calendar size={20} />
                                    </div>
                                    {categoryInfo && (
                                        <Badge className={`${categoryInfo.color} border-0`}>
                                            {categoryInfo.label}
                                        </Badge>
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit?.(event)}>
                                            <Pencil size={14} className="mr-2" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setEventToDelete(event)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 size={14} className="mr-2" />
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg mb-3">{event.title}</CardTitle>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {formatDate(event.start_date)}
                                    </div>
                                    
                                    {!event.all_day && (
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {formatTime(event.start_date)}
                                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                                        </div>
                                    )}

                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            {event.location}
                                        </div>
                                    )}
                                </div>

                                {event.description && (
                                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                                        {event.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{eventToDelete?.title}"? Esta ação não pode ser desfeita.
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
