import axios from 'axios';

export const axiosInstance = axios.create({
    // Dynamically switch the URL based on development vs production
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
    withCredentials: true,
});