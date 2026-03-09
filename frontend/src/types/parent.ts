export interface ParentResponse {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    profession?: string;
    userId?: string;
    hasUserAccount: boolean;
    linkedStudentsCount: number;
    createdAt: string;
}

export interface CreateParentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    profession?: string;
    createAccount: boolean;
}

export interface UpdateParentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    profession?: string;
}
