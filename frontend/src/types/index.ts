export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  isActive: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponseSuccess<T> {
  message: string;
  data?: T;
}