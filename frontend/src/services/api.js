import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
  : "https://progresslens.onrender.com";

const API = axios.create({
  baseURL: `${SERVER_URL}/api`, // backend URL
});

// attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  console.log("API Interceptor: Sending token", token ? "EXISTS" : "MISSING");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized Details:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default API;
