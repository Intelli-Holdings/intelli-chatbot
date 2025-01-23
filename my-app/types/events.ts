export interface BaseEvent {
  id?: number;
  name: string;
  description: string;
}

export interface EscalationEvent extends BaseEvent {
  organization_id: string;
}

export interface Event extends BaseEvent {
  id: number;
  system_name: string;
  created_at: string;
  updated_at: string;
}