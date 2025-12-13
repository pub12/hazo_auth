export type InitUsersOptions = {
    /** Email address of the user to assign super user role (overrides config) */
    email?: string;
};
/**
 * Initializes users, roles, and permissions from configuration
 * This function reads from hazo_auth_config.ini and sets up:
 * 1. Permissions from [hazo_auth__user_management] application_permission_list_defaults
 * 2. A default_super_user_role with all permissions
 * 3. Assigns the role to user from --email parameter or [hazo_auth__initial_setup] default_super_user_email
 */
export declare function handle_init_users(options?: InitUsersOptions): Promise<void>;
/**
 * Shows help for the init-users command
 */
export declare function show_init_users_help(): void;
//# sourceMappingURL=init_users.d.ts.map