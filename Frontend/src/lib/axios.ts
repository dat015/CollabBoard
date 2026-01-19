import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Create an Axios instance with base configuration
const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token before sending requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically handle response errors
axiosClient.interceptors.response.use(
  (response) => response.data, // Return only data, ignore Axios response wrapper
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
