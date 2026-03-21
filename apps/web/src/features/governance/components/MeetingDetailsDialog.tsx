import React, { useState } from 'react';
import {
    Calendar,
    MapPin,
    FileText,
    Users,
    Check,
    Clock,
    Edit,
    Save,
    X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import type { Meeting, UpdateMeetingDTO } from '../../../services/governance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MeetingDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: Meeting | null;
    councilMembers: { id: string; name: string }[];
    onUpdate: (meetingId: string, data: UpdateMeetingDTO) => Promise<void>;
    onComplete: (meetingId: string) => Promise<void>;
    isUpdating?: boolean;
    canEdit?: boolean;
}

/**
 * Dialog for viewing meeting details, recording minutes and marking attendance.
 * 
 * Features:
 * - View meeting information (date, location, agenda)
 * - Edit meeting minutes (ata)
 * - Mark attendance for each council member
 * - Complete/finalize the meeting
 */
export function MeetingDetailsDialog({
    isOpen,
    onClose,
    meeting,
    councilMembers,
    onUpdate,
    onComplete,
    isUpdating,
    canEdit = true
}: MeetingDetailsDialogProps) {
    // Initialize state from meeting - these reset when meeting.id changes
    const meetingId = meeting?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [minutes, setMinutes] = useState(() => meeting?.minutes || '');
    const [attendees, setAttendees] = useState<string[]>(() => meeting?.attendees || []);

    // Reset local state when meeting changes (via key in parent or meeting ID change)
    const prevMeetingIdRef = React.useRef(meetingId);
    if (meetingId !== prevMeetingIdRef.current) {
        prevMeetingIdRef.current = meetingId;
        // Using this pattern instead of useEffect to avoid React Compiler warnings
        if (meeting) {
            setMinutes(meeting.minutes || '');
            setAttendees(meeting.attendees || []);
            setIsEditing(false);
        }
    }

    if (!meeting) return null;

    const isCompleted = meeting.status === 'COMPLETED';
    const isCancelled = meeting.status === 'CANCELLED';
    const canModify = canEdit && !isCompleted && !isCancelled;

    const meetingDate = parseISO(meeting.date);
    const formattedDate = format(meetingDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = format(meetingDate, "HH:mm", { locale: ptBR });

    const handleToggleAttendee = (memberId: string) => {
        if (!canModify) return;

        setAttendees(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSave = async () => {
        await onUpdate(meeting.id, {
            minutes: minutes || undefined,
            attendees: attendees.length > 0 ? attendees : undefined,
        });
        setIsEditing(false);
    };

    const handleComplete = async () => {
        // Save any pending changes first
        if (minutes !== meeting.minutes || JSON.stringify(attendees) !== JSON.stringify(meeting.attendees)) {
            await onUpdate(meeting.id, {
                minutes: minutes || undefined,
                attendees: attendees.length > 0 ? attendees : undefined,
            });
        }
        await onComplete(meeting.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh]" data-testid="meeting-details-dialog">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={20} aria-hidden="true" />
                        Detalhes da Reunião
                    </DialogTitle>
                    <DialogDescription>
                        {meeting.meeting_type === 'ORDINARY' ? 'Reunião Ordinária' : 'Reunião Extraordinária'}
                        {isCompleted && (
                            <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                <Check size={12} className="mr-1" aria-hidden="true" />
                                Finalizada
                            </Badge>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Meeting Info */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className="text-indigo-500" aria-hidden="true" />
                                <span className="capitalize">{formattedDate}</span>
                                <span className="text-gray-400">às</span>
                                <span className="font-medium">{formattedTime}</span>
                            </div>

                            {meeting.location && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin size={14} className="text-indigo-500" aria-hidden="true" />
                                    <span>{meeting.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Agenda */}
                        {meeting.agenda && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <FileText size={14} aria-hidden="true" />
                                    Pauta
                                </Label>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                    {meeting.agenda}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Attendance */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-1">
                                <Users size={14} aria-hidden="true" />
                                Lista de Presença ({attendees.length}/{councilMembers.length})
                            </Label>
                            <div className="space-y-2">
                                {councilMembers.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">
                                        Nenhum membro cadastrado no órgão
                                    </p>
                                ) : (
                                    councilMembers.map(member => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-2 py-1"
                                        >
                                            <Checkbox
                                                id={`attendee-${member.id}`}
                                                checked={attendees.includes(member.id)}
                                                onCheckedChange={() => handleToggleAttendee(member.id)}
                                                disabled={!canModify}
                                                data-testid={`attendee-checkbox-${member.id}`}
                                            />
                                            <Label
                                                htmlFor={`attendee-${member.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {member.name}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Minutes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-1">
                                    <FileText size={14} aria-hidden="true" />
                                    Ata da Reunião
                                </Label>
                                {canModify && !isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit size={14} className="mr-1" aria-hidden="true" />
                                        Editar
                                    </Button>
                                )}
                            </div>

                            {isEditing && canModify ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={minutes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMinutes(e.target.value)}
                                        placeholder="Registre aqui os principais pontos discutidos e deliberações da reunião..."
                                        rows={6}
                                        data-testid="meeting-minutes-input"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setMinutes(meeting.minutes || '');
                                                setIsEditing(false);
                                            }}
                                        >
                                            <X size={14} className="mr-1" aria-hidden="true" />
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={isUpdating}
                                            data-testid="save-minutes-btn"
                                        >
                                            <Save size={14} className="mr-1" aria-hidden="true" />
                                            Salvar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm min-h-[100px]">
                                    {minutes || (
                                        <span className="text-gray-400 italic">
                                            {isCompleted
                                                ? 'Nenhuma ata registrada.'
                                                : 'Clique em "Editar" para registrar a ata.'
                                            }
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {canModify && (
                        <Button
                            variant="default"
                            onClick={handleComplete}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="complete-meeting-btn"
                        >
                            <Check size={14} className="mr-1" aria-hidden="true" />
                            Finalizar Reunião
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
