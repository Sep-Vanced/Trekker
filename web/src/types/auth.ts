export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  offline_maps_downloaded: boolean;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  role: string;
};
