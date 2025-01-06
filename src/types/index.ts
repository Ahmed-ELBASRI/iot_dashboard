export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  apiKey: string;
  role: "user" | "admin";
  idrole: number;
  password: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface Accident {
  id: number;
  status: "up" | "being resolved" | "resolved";
  accidentDate: string;
  resolutionStartDate?: string;
  resolutionDate?: string;
  resolvedBy?: string;
  temperature: number;
}

export interface Comment {
  id: number;
  accidentId: number;
  content: string;
  userName: string;
  timestamp: string;
}
