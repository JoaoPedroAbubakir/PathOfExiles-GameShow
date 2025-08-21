export interface User {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  username: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  username: string;
  password: string;
}
