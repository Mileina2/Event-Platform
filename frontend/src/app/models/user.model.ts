export type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt?: string;
}
