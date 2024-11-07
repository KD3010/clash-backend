import type { Request } from 'express';

export interface AuthUser {
    id: number,
    name: string,
    email: string,
}

export interface IRequest extends Request {
    user?: AuthUser | null
}