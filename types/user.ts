export type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  addresses?: Address[];
  wishlist?: string[];
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserRole = "user" | "admin" | "moderator";

export type UserPreferences = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  theme: "light" | "dark" | "system";
};

export type Address = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: Date;
};

