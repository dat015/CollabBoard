import type { BaseResponse } from "@/types/BaseResponse";

export interface LoginRequest {
    Email: string;
    Password: string;
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    role?: string;
    token: string;
    refreshToken: string;
}

export type LoginResponse = BaseResponse<User>;