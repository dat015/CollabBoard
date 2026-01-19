import type { BaseResponse } from "@/types/BaseResponse";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role?: string;
    token: string;
}

export type LoginResponse = BaseResponse<User>;