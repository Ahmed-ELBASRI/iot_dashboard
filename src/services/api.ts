import axios from 'axios';
import { startOfDay, eachDayOfInterval, eachMonthOfInterval, addDays, addMonths } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { Accident } from '../types';

// Load initial accidents from localStorage or use default
const getStoredAccidents = (): Accident[] => {
  const stored = localStorage.getItem('accidents');
  return stored ? JSON.parse(stored) : [
    {
      id: 1,
      accidentDate: new Date().toISOString(),
      status: 'up',
      temperature: 35
    }
  ];
};

let accidents = getStoredAccidents();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const generateMockData = (startDate: Date, endDate: Date, period: string, type: 'temperature' | 'humidity') => {
  let dates: Date[] = [];
  
  if (period === 'today') {
    const currentHour = new Date().getHours();
    dates = Array.from({ length: currentHour + 1 }, (_, i) => {
      const date = new Date();
      date.setHours(i, 0, 0, 0);
      return date;
    });
  } else if (period === 'week' || period === 'month') {
    dates = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (period === 'year') {
    dates = eachMonthOfInterval({ start: startDate, end: endDate });
  }

  return dates.map(date => ({
    timestamp: date.toISOString(),
    value: type === 'temperature' 
      ? Math.round((20 + Math.random() * 10) * 10) / 10
      : Math.round((50 + Math.random() * 20) * 10) / 10,
    min: type === 'temperature'
      ? Math.round((15 + Math.random() * 5) * 10) / 10
      : Math.round((40 + Math.random() * 10) * 10) / 10,
    max: type === 'temperature'
      ? Math.round((25 + Math.random() * 10) * 10) / 10
      : Math.round((60 + Math.random() * 20) * 10) / 10
  }));
};

export const authService = {
  login: async (email: string, password: string) => {
    if (email === 'test' && password === 'test') {
      return {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test',
          role: 'admin',
          cin: 'TEST123',
        },
        token: 'mock-jwt-token',
      };
    }
    throw new Error('Invalid credentials');
  },
};

export const sensorService = {
  getCurrentData: async () => {
    return {
      current: { temperature: 25, humidity: 60 },
      maxToday: { temperature: 28, humidity: 65 }
    };
  },
  getHistoricalData: async (type: 'temperature' | 'humidity', period: string, startDate?: string, endDate?: string) => {
    const now = new Date();
    let start = startOfDay(now);
    let end = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'week':
          start = addDays(now, -7);
          break;
        case 'month':
          start = addMonths(now, -1);
          break;
        case 'year':
          start = addMonths(now, -12);
          break;
      }
    }

    return generateMockData(start, end, period, type);
  },
};

export const accidentService = {
  getAccidents: async () => {
    return accidents;
  },
  updateAccidentStatus: async (id: number, status: string, resolvedBy: string) => {
    const updatedAccident = {
      ...accidents.find(a => a.id === id)!,
      status,
      resolvedBy,
      resolutionStartDate: status === 'being resolved' ? new Date().toISOString() : undefined,
      resolutionDate: status === 'resolved' ? new Date().toISOString() : undefined
    };
    
    accidents = accidents.map(accident => 
      accident.id === id ? updatedAccident : accident
    );
    
    localStorage.setItem('accidents', JSON.stringify(accidents));
    return updatedAccident;
  },
};