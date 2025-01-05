import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: number, userData: Partial<User>) => void;
  deleteUser: (id: number) => void;
  getUsers: () => User[];
}

// Initialize users from localStorage or use default admin user
const initialUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
if (initialUsers.length === 0) {
  initialUsers.push({
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    apiKey: 'admin-key-123',
    role: 'admin'
  });
  localStorage.setItem('users', JSON.stringify(initialUsers));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  users: initialUsers,
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  addUser: (userData) => {
    const { users } = get();
    const newUser = {
      ...userData,
      id: Math.max(0, ...users.map(u => u.id)) + 1
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  updateUser: (id, userData) => {
    const { users } = get();
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, ...userData } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  deleteUser: (id) => {
    const { users } = get();
    const updatedUsers = users.filter(user => user.id !== id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  getUsers: () => get().users
}));