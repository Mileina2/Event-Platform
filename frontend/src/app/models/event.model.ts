export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  capacity: number;
  status: EventStatus;
  organizerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  capacity: number;
}
