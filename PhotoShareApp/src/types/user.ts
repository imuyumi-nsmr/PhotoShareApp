export type UserRole = 'Admin'|'User'

export interface User{
    id:string;
    name:string;
    email?:string;
    role:UserRole;
    groupId: string;
}

export interface LoginResponse{
 user:User;
 token:string;
}