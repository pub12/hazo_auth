export type RolesMatrixData = {
    roles: Array<{
        role_id?: number;
        role_name: string;
        selected: boolean;
        permissions: string[];
    }>;
};
export type RolesMatrixProps = {
    add_button_enabled?: boolean;
    role_name_selection_enabled?: boolean;
    permissions_read_only?: boolean;
    show_save_cancel?: boolean;
    user_id?: string;
    onSave?: (data: RolesMatrixData) => void;
    onCancel?: () => void;
    onRoleSelection?: (role_id: number, role_name: string) => void;
    className?: string;
};
/**
 * Roles matrix component - reusable internal component for roles-permissions matrix
 * Shows data table with permissions as columns and roles as rows
 * Checkboxes in cells indicate role-permission mappings
 * Changes are stored locally and only saved when Save button is pressed
 * @param props - Component props including button enable flags and save callback
 * @returns Roles matrix component
 */
export declare function RolesMatrix({ add_button_enabled, role_name_selection_enabled, permissions_read_only, show_save_cancel, user_id, onSave, onCancel, onRoleSelection, className, }: RolesMatrixProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=roles_matrix.d.ts.map