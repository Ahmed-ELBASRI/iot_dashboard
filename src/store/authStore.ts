import { create } from "zustand";
import { User } from "../types";
import axios from "axios";

interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: number, userData: Partial<User>) => void;
  deleteUser: (id: number) => void;
  getUsers: () => User[];
}

// Initialize users from localStorage or use default admin user
const initialUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");

const response = await axios.get("http://127.0.0.1:8000/api/users/");
const usersFromDB = response.data;

// Map API data to match the desired structure
const mappedUsers = usersFromDB.map((user: any) => ({
  id: user.id,
  firstName: user.nom, // Assuming 'nom' corresponds to 'firstName'
  lastName: user.prenom, // Assuming 'prenom' corresponds to 'lastName'
  email: user.email,
  apiKey: user.apikey,
  role: user.idrole === 1 ? "user" : "admin", // Map idrole to role
}));

// Save to localStorage
localStorage.setItem("users", JSON.stringify(mappedUsers));

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  users: initialUsers,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");

    set({ user: null, token: null });
  },

  addUser: async (userData) => {
    console.log(userData);
    const { users } = get();
    const newUserBd = {
      nom: userData.firstName,
      prenom: userData.lastName,
      email: userData.email,
      mdp: userData.password,
      apikey: userData.apiKey,
      idrole: userData.role === "user" ? 1 : 2,
    };

    const response = await axios.post(
      "http://127.0.0.1:8000/api/users/",
      newUserBd
    );

    console.log("User created successfully:", response.data);
    // return response.data;

    const newUser = {
      ...userData,

      // id: Math.max(0, ...users.map((u) => u.id)) + 1,
      id: response.data.id,
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  updateUser: async (id, userData) => {
    const { users } = get();
    const password = users.find((u) => u.id === id)?.password;

    const newUserBd = {
      id: id,
      nom: userData.firstName,
      prenom: userData.lastName,
      email: userData.email,
      mdp: userData.password == "" ? password : userData.password,
      apikey: userData.apiKey,
      idrole: userData.role === "user" ? 1 : 2,
    };
    const response = await axios.put(
      `http://127.0.0.1:8000/api/users/${id}/`,
      newUserBd
    );

    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, ...userData } : user
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  deleteUser: async (id) => {
    const { users } = get();
    const response = await axios.delete(
      `http://127.0.0.1:8000/api/users/${id}/`
    );
    const updatedUsers = users.filter((user) => user.id !== id);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  getUsers: () => get().users,
}));
