export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  role?: {
    id: number;
    name: string;
    type: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}
