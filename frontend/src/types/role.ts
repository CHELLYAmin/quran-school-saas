export interface PermissionResponse {
    id: string;
    name: string;
    code: string;
    module: string;
    description?: string;
}

export interface RoleResponse {
    id: string;
    name: string;
    description?: string;
    isSystemRole: boolean;
    permissions: PermissionResponse[];
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
}

export interface AssignPermissionsRequest {
    permissionIds: string[];
}
