import { useState, useMemo } from 'react';
import { Plus, Calendar, CalendarCheck, CalendarX } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";
import { MeetingCard } from './MeetingCard';
import { CreateMeetingDialog } from './CreateMeetingDialog';
import { MeetingDetailsDialog } from './MeetingDetailsDialog';
import { EmptyState } from "../../../components/EmptyState";
import type { Council, Meeting, MeetingType, UpdateMeetingDTO } from '../../../services/governance';
import { useMeetings, useCreateMeeting, useUpdateMeeting, useCompleteMeeting } from '../hooks/useGovernance';
import { isPast, parseISO, isToday } from 'date-fns';
import { useAuthTenant } from '../../../contexts/AuthContext';

interface MeetingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    council: Council | null;
    /** List of council members with their names for attendance tracking */
    membersList?: { id: string; name: string }[];
}

/**
 * Main dialog for managing meetings of a council.
 * 
 * Features:
 * - Tabbed view for upcoming vs past meetings
 * - Create new meetings
 * - View meeting details
 * - Edit meeting minutes and attendance
 * - Complete/finalize meetings
 */
export function MeetingsDialog({
    isOpen,
    onClose,
    council,
    membersList = []
}: MeetingsDialogProps) {
  const tenant = useAuthTenant();
    const tenantId = tenant?.id;
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const { data: meetings, isLoading } = useMeetings(tenantId, council?.id);
    const createMeeting = useCreateMeeting(tenantId, council?.id);
    const updateMeeting = useUpdateMeeting(tenantId, council?.id);
    const completeMeeting = useCompleteMeeting(tenantId, council?.id);

    // Separate meetings into upcoming and past
    const { upcomingMeetings, pastMeetings } = useMemo(() => {
        if (!meetings) return { upcomingMeetings: [], pastMeetings: [] };

        const upcoming: Meeting[] = [];
        const past: Meeting[] = [];

        meetings.forEach((meeting) => {
            const meetingDate = parseISO(meeting.date);
            const isPastMeeting = isPast(meetingDate) && !isToday(meetingDate);
            const isCompleted = meeting.status === 'COMPLETED';

            if (isPastMeeting || isCompleted) {
                past.push(meeting);
            } else {
                upcoming.push(meeting);
            }
        });

        // Sort upcoming by date ascending (soonest first)
        upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Sort past by date descending (most recent first)
        past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { upcomingMeetings: upcoming, pastMeetings: past };
    }, [meetings]);

    const handleCreateMeeting = async (data: {
        date: string;
        location?: string;
        agenda?: string;
        meeting_type: MeetingType
    }) => {
        await createMeeting.mutateAsync(data);
        setShowCreateDialog(false);
    };

    const handleUpdateMeeting = async (meetingId: string, data: UpdateMeetingDTO) => {
        await updateMeeting.mutateAsync({ meetingId, data });
    };

    const handleCompleteMeeting = async (meetingId: string) => {
        await completeMeeting.mutateAsync(meetingId);
        setSelectedMeeting(null);
    };

    const renderMeetingsList = (meetingsList: Meeting[], emptyMessage: string) => {
        if (meetingsList.length === 0) {
            return (
                <div className="py-8">
                    <EmptyState
                        icon={Calendar}
                        title="Nenhuma reunião"
                        description={emptyMessage}
                    />
                </div>
            );
        }

        return (
            <div className="grid gap-4">
                {meetingsList.map(meeting => (
                    <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onView={setSelectedMeeting}
                        onEdit={meeting.status !== 'COMPLETED' ? setSelectedMeeting : undefined}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh]" data-testid="meetings-dialog">
                    <DialogHeader className="pr-8">
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="text-indigo-600" size={20} aria-hidden="true" />
                            Reuniões - {council?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Gerencie as reuniões deste órgão de governança
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end -mt-2 mb-2">
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            size="sm"
                            data-testid="new-meeting-btn"
                        >
                            <Plus size={16} className="mr-1" aria-hidden="true" />
                            Nova Reunião
                        </Button>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}
                        className="mt-4"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upcoming" className="flex items-center gap-1">
                                <CalendarCheck size={14} aria-hidden="true" />
                                Próximas ({upcomingMeetings.length})
                            </TabsTrigger>
                            <TabsTrigger value="past" className="flex items-center gap-1">
                                <CalendarX size={14} aria-hidden="true" />
                                Realizadas ({pastMeetings.length})
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[50vh] mt-4 pr-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="upcoming" className="mt-0">
                                        {renderMeetingsList(
                                            upcomingMeetings,
                                            'Nenhuma reunião agendada. Clique em "Nova Reunião" para agendar.'
                                        )}
                                    </TabsContent>

                                    <TabsContent value="past" className="mt-0">
                                        {renderMeetingsList(
                                            pastMeetings,
                                            'Nenhuma reunião realizada ainda.'
                                        )}
                                    </TabsContent>
                                </>
                            )}
                        </ScrollArea>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Create Meeting Dialog */}
            <CreateMeetingDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateMeeting}
                councilName={council?.name || ''}
                isLoading={createMeeting.isPending}
            />

            {/* Meeting Details Dialog */}
            <MeetingDetailsDialog
                isOpen={!!selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
                meeting={selectedMeeting}
                councilMembers={membersList}
                onUpdate={handleUpdateMeeting}
                onComplete={handleCompleteMeeting}
                isUpdating={updateMeeting.isPending || completeMeeting.isPending}
            />
        </>
    );
}
