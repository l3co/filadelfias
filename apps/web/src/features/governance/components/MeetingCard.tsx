import { memo } from 'react';
import { Calendar, MapPin, FileText, Users, Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { Meeting, MeetingStatus, MeetingType } from '../../../services/governance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MeetingCardProps {
    meeting: Meeting;
    onView: (meeting: Meeting) => void;
    onEdit?: (meeting: Meeting) => void;
}

/**
 * Displays a single meeting in a card format.
 * 
 * Visual indicators:
 * - Green badge/icon for scheduled future meetings
 * - Blue badge for in-progress meetings  
 * - Gray badge with checkmark for completed meetings
 * - Red badge for cancelled meetings
 */
export const MeetingCard = memo(function MeetingCard({ meeting, onView, onEdit }: MeetingCardProps) {
    const meetingDate = parseISO(meeting.date);
    const isCompleted = meeting.status === 'COMPLETED';
    const isCancelled = meeting.status === 'CANCELLED';

    const getStatusBadge = (status: MeetingStatus) => {
        const configs: Record<MeetingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
            'SCHEDULED': {
                label: 'Agendada',
                variant: 'default',
                icon: <Clock size={12} className="mr-1" />
            },
            'IN_PROGRESS': {
                label: 'Em andamento',
                variant: 'secondary',
                icon: <AlertCircle size={12} className="mr-1" />
            },
            'COMPLETED': {
                label: 'Realizada',
                variant: 'outline',
                icon: <Check size={12} className="mr-1" />
            },
            'CANCELLED': {
                label: 'Cancelada',
                variant: 'destructive',
                icon: <AlertCircle size={12} className="mr-1" />
            },
        };
        const config = configs[status];
        return (
            <Badge variant={config.variant} className="text-xs flex items-center">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const getTypeBadge = (type: MeetingType) => {
        return (
            <Badge variant="outline" className="text-[10px] uppercase">
                {type === 'ORDINARY' ? 'Ordinária' : 'Extraordinária'}
            </Badge>
        );
    };

    const formattedDate = format(meetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = format(meetingDate, "HH:mm", { locale: ptBR });

    return (
        <Card
            className={`hover:shadow-md transition-shadow ${isCompleted || isCancelled ? 'opacity-75' : ''}`}
            data-testid={`meeting-card-${meeting.id}`}
        >
            <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                        {getTypeBadge(meeting.meeting_type)}
                        {getStatusBadge(meeting.status)}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="font-medium">{formattedDate}</span>
                        <span className="text-gray-400">às</span>
                        <span className="font-medium">{formattedTime}</span>
                    </div>

                    {meeting.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-indigo-500" />
                            <span>{meeting.location}</span>
                        </div>
                    )}

                    {meeting.agenda && (
                        <div className="flex items-start gap-2">
                            <FileText size={14} className="text-indigo-500 mt-0.5" />
                            <span className="line-clamp-2">{meeting.agenda}</span>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="flex items-center gap-2 text-green-600">
                            <Users size={14} />
                            <span>
                                {meeting.attendees?.length || 0} presente(s)
                                {meeting.minutes && ' • Ata registrada'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onView(meeting)}
                        data-testid={`view-meeting-${meeting.id}`}
                    >
                        {isCompleted ? 'Ver Ata' : 'Detalhes'}
                    </Button>
                    {!isCompleted && !isCancelled && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                            onClick={() => onEdit(meeting)}
                            data-testid={`edit-meeting-${meeting.id}`}
                        >
                            Editar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
