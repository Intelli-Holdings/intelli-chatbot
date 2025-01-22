import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, RefreshCw } from "lucide-react";
import { Event } from "@/types/events";

  interface EventCardProps {
    event: Event;
    onEdit: (event: Event) => void;
    onDelete: (id: number) => void;
  }

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {event.system_name}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created: {format(new Date(event.created_at), 'PP')}</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Updated: {format(new Date(event.updated_at), 'PP')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}