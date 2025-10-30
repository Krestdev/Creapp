// lib/axios.ts
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const baseURL =
  process.env.NEXT_PUBLIC_API || "https://creappapi.krestdev.com/api/v1.0.0";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add Authorization token if available
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("creapp") || "{}")?.state?.token
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("Request setup error.");
    return Promise.reject(error);
  }
);

export default api;
