export type AppUserDataEditorProps = {
    /** User ID to edit */
    userId: string;
    /** Current app_user_data value */
    currentData: Record<string, unknown> | null;
    /** Callback when data is saved */
    onSave?: (newData: Record<string, unknown>) => void;
    /** Whether the editor is read-only (no edit button) */
    readOnly?: boolean;
};
export declare function AppUserDataEditor({ userId, currentData, onSave, readOnly, }: AppUserDataEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=app_user_data_editor.d.ts.map