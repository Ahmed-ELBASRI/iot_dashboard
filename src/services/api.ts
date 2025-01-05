import axios from "axios";
import {
  startOfDay,
  eachDayOfInterval,
  eachMonthOfInterval,
  addDays,
  addMonths,
} from "date-fns";
import { useAuthStore } from "../store/authStore";
import { Accident } from "../types";

// Load initial accidents from localStorage or use default
const getStoredAccidents = (): Accident[] => {
  const stored = localStorage.getItem("accidents");
  return stored
    ? JSON.parse(stored)
    : [
        {
          id: 1,
          accidentDate: new Date().toISOString(),
          status: "up",
          temperature: 35,
        },
      ];
};

let accidents = getStoredAccidents();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const generateMockData = (
  startDate: Date,
  endDate: Date,
  period: string,
  type: "temperature" | "humidity"
) => {
  let dates: Date[] = [];

  if (period === "today") {
    const currentHour = new Date().getHours();
    dates = Array.from({ length: currentHour + 1 }, (_, i) => {
      const date = new Date();
      date.setHours(i, 0, 0, 0);
      return date;
    });
  } else if (period === "week" || period === "month") {
    dates = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (period === "year") {
    dates = eachMonthOfInterval({ start: startDate, end: endDate });
  }

  return dates.map((date) => ({
    timestamp: date.toISOString(),
    value:
      type === "temperature"
        ? Math.round((20 + Math.random() * 10) * 10) / 10
        : Math.round((50 + Math.random() * 20) * 10) / 10,
    min:
      type === "temperature"
        ? Math.round((15 + Math.random() * 5) * 10) / 10
        : Math.round((40 + Math.random() * 10) * 10) / 10,
    max:
      type === "temperature"
        ? Math.round((25 + Math.random() * 10) * 10) / 10
        : Math.round((60 + Math.random() * 20) * 10) / 10,
  }));
};

// export const authService = {
//   login: async (email: string, password: string) => {
//     if (email === "test" && password === "test") {
//       return {
//         user: {
//           id: 1,
//           name: "Test User",
//           email: "test",
//           role: "admin",
//           cin: "TEST123",
//         },
//         token: "mock-jwt-token",
//       };
//     }
//     throw new Error("Invalid credentials");
//   },
// };

export const authService = {
  login: async (email: string, password: string) => {
    try {
      // First API call: Check the user
      const loginResponse = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          email,
          mdp: password,
        }
      );

      // If login is successful, proceed to the next step
      if (loginResponse.status === 200) {
        const { id } = loginResponse.data; // Manually provide the ID for the next call (update this if necessary)
        console.log(id);

        // Second API call: Retrieve the user details
        const userResponse = await axios.get(
          `http://localhost:8000/api/users/${id}`
        );
        console.log(userResponse.data);

        // localStorage.setItem("username", userResponse.data.userName);

        // Combine the results and return
        // return {
        //   user: userResponse.data, // User details
        //   token: "mock-jwt-token",
        // };
        return {
          user: {
            id: userResponse.data.id,
            name: userResponse.data.nom,
            email: userResponse.data.email,
            role: userResponse.data.idrole === 2 ? "admin" : "admin",
            cin: "TEST123",
          },
          token: "mock-jwt-token",
        };
      }

      throw new Error("Login failed: Invalid response from server");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "An error occurred during authentication"
      );
    }
  },
};

export const sensorService = {
  getCurrentData: async () => {
    const maxTodayResponse = await axios.get(
      "http://127.0.0.1:8000/api/daily-max/"
    );
    const maxTodayData = maxTodayResponse.data;

    // Second API call to get current temperature and humidity
    const currentValueResponse = await axios.get(
      "http://127.0.0.1:8000/api/current-value/"
    );
    const currentValueData = currentValueResponse.data;

    return {
      current: {
        temperature: currentValueData.temperature,
        humidity: currentValueData.humidity,
      },
      maxToday: {
        temperature: maxTodayData.max_temp,
        humidity: maxTodayData.max_humidity,
      },
    };
  },
  getHistoricalData: async (
    type: "temperature" | "humidity",
    period: string,
    startDate?: string,
    endDate?: string
  ) => {
    const now = new Date();
    let start = startOfDay(now);
    let end = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case "week":
          start = addDays(now, -7);
          break;
        case "month":
          start = addMonths(now, -1);
          break;
        case "year":
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
  updateAccidentStatus: async (
    id: number,
    status: string,
    resolvedBy: string
  ) => {
    const updatedAccident = {
      ...accidents.find((a) => a.id === id)!,
      status,
      resolvedBy,
      resolutionStartDate:
        status === "being resolved" ? new Date().toISOString() : undefined,
      resolutionDate:
        status === "resolved" ? new Date().toISOString() : undefined,
    };

    accidents = accidents.map((accident) =>
      accident.id === id ? updatedAccident : accident
    );

    localStorage.setItem("accidents", JSON.stringify(accidents));
    return updatedAccident;
  },
};
