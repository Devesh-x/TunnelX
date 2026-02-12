import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface Tunnel {
    id: string;
    publicUrl: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
    };
}

export interface TunnelsResponse {
    success: boolean;
    data: {
        tunnels: Tunnel[];
    };
}

export interface UserResponse {
    success: boolean;
    data: {
        user: User;
    };
}

// API Functions
export const register = (email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, password });

export const login = (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password });

export const getCurrentUser = () => api.get<UserResponse>('/auth/me');

export const createTunnel = () => api.post('/tunnels/create');

export const getTunnels = () => api.get<TunnelsResponse>('/tunnels');

export const deleteTunnel = (id: string) => api.delete(`/tunnels/${id}`);

export default api;
