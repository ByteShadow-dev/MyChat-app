import { create } from 'zustand';
import axios from 'axios';
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'
import { io } from "socket.io-client";

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
    user:null,
    isAuthenticated:false,
    error:null,
    isLoading:false,
    isCheckingAuth:true,
	isUpdatingProfile: false, 
	onlineUsers: [],
	socket: null,

    signup: async(username, name, email, password) => {
        set({isLoading:true, error:null})
        try{
            const response = await axios.post(`${API_URL}/signup`, {username, name, email, password});
            set({user:response.data.user, isAuthenticated:true, isLoading:false});
        }catch(error){
            set({error:error.response.data.message || "Error signing up", isLoading:false});
            throw error;
        }
    },
    login: async (usernameOrEmail, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { usernameOrEmail, password });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
			get().connectSocket();
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			get().disconnectSocket();
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
			get().connectSocket();
		} catch (err) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},
	forgotPassword: async (usernameOrEmail) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { usernameOrEmail });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	
	},
	updateProfile: async (data) => {
		set({ isUpdatingProfile: true});
		try{
			const res = await axiosInstance.put("/auth/update-profile", data);
			set({ user: res.data});
			toast.success("Profile updated successfully");
		}catch(error){
			console.log("Error in updateProfile store: ", error);
			toast.error(error.response.data.message);
		}finally{
			set({isUpdatingProfile: false});
		}
	},
	connectSocket: () => {

		const { user } = get();
		if (!user || get().socket?.connected) return;

		const socket = io("http://localhost:5000", {
			query: {
				userId: user._id,  // ← was "user"
			},
		});
		socket.connect();

		set({ socket: socket });

		socket.on("getOnlineUsers", (user) => {
		set({ onlineUsers: user });
		});
	},
	disconnectSocket: () => {
		if (get().socket?.connected) get().socket.disconnect();
	},
	
	
}))