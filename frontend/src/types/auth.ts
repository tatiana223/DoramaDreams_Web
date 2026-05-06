export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
};