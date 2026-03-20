import { Calendar, Clock, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { Event } from '../../../services/events';
import {
  EVENT_CATEGORY_LABELS,
  formatEventCardDate,
  formatEventCardTime,
  isPastEvent,
} from '../lib/eventPresentation';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const categoryInfo = event.category ? EVENT_CATEGORY_LABELS[event.category] : null;
  const isPast = isPastEvent(event.start_date);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar size={20} />
          </div>
          {categoryInfo && <Badge className={`${categoryInfo.color} border-0`}>{categoryInfo.label}</Badge>}
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
              onClick={() => onDelete?.(event)}
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
            {formatEventCardDate(event.start_date)}
          </div>

          {!event.all_day && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              {formatEventCardTime(event.start_date)}
              {event.end_date && ` - ${formatEventCardTime(event.end_date)}`}
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              {event.location}
            </div>
          )}
        </div>

        {event.description && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{event.description}</p>}
      </CardContent>
    </Card>
  );
}
