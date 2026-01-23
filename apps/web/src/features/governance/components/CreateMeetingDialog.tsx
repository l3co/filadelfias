import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, FileText, CalendarClock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import type { MeetingType } from '../../../services/governance';

interface CreateMeetingFormData {
    date: string;
    time: string;
    location: string;
    agenda: string;
    meeting_type: MeetingType;
}

interface CreateMeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { date: string; location?: string; agenda?: string; meeting_type: MeetingType }) => Promise<void>;
    councilName: string;
    isLoading?: boolean;
}

/**
 * Dialog for creating/scheduling a new meeting.
 * 
 * Collects date, time, location, agenda and meeting type (ordinary/extraordinary).
 * Time is combined with date into ISO format for the API.
 */
export function CreateMeetingDialog({
    isOpen,
    onClose,
    onSubmit,
    councilName,
    isLoading
}: CreateMeetingDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateMeetingFormData>({
        defaultValues: {
            meeting_type: 'ORDINARY',
            date: '',
            time: '19:30',
            location: '',
            agenda: '',
        }
    });

    const meetingType = watch('meeting_type');

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onFormSubmit = async (data: CreateMeetingFormData) => {
        // Combine date and time into ISO format
        const dateTime = new Date(`${data.date}T${data.time}:00`);

        await onSubmit({
            date: dateTime.toISOString(),
            location: data.location || undefined,
            agenda: data.agenda || undefined,
            meeting_type: data.meeting_type,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md" data-testid="create-meeting-dialog">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="text-indigo-600" size={20} />
                        Nova Reunião
                    </DialogTitle>
                    <DialogDescription>
                        Agendar reunião para {councilName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {/* Meeting Type */}
                    <div className="space-y-2">
                        <Label htmlFor="meeting_type">Tipo de Reunião</Label>
                        <Select
                            value={meetingType}
                            onValueChange={(value: MeetingType) => setValue('meeting_type', value)}
                        >
                            <SelectTrigger id="meeting_type" data-testid="meeting-type-select">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ORDINARY">Reunião Ordinária</SelectItem>
                                <SelectItem value="EXTRAORDINARY">Reunião Extraordinária</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">
                                <Calendar size={14} className="inline mr-1" />
                                Data *
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                {...register('date', { required: 'Data é obrigatória' })}
                                data-testid="meeting-date-input"
                            />
                            {errors.date && (
                                <p className="text-xs text-red-500">{errors.date.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Horário *</Label>
                            <Input
                                id="time"
                                type="time"
                                {...register('time', { required: 'Horário é obrigatório' })}
                                data-testid="meeting-time-input"
                            />
                            {errors.time && (
                                <p className="text-xs text-red-500">{errors.time.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">
                            <MapPin size={14} className="inline mr-1" />
                            Local
                        </Label>
                        <Input
                            id="location"
                            placeholder="Ex: Salão da Igreja"
                            {...register('location')}
                            data-testid="meeting-location-input"
                        />
                    </div>

                    {/* Agenda */}
                    <div className="space-y-2">
                        <Label htmlFor="agenda">
                            <FileText size={14} className="inline mr-1" />
                            Pauta
                        </Label>
                        <Textarea
                            id="agenda"
                            placeholder="Assuntos a serem tratados na reunião..."
                            rows={3}
                            {...register('agenda')}
                            data-testid="meeting-agenda-input"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            data-testid="submit-create-meeting"
                        >
                            {isLoading ? 'Agendando...' : 'Agendar Reunião'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
