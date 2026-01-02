export type FirmBranding = {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    tagline?: string;
};
export type BrandingEditorProps = {
    scopeId: string;
    scopeName: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (branding: FirmBranding | null) => void;
    initialBranding?: FirmBranding | null;
};
export declare function BrandingEditor({ scopeId, scopeName, isOpen, onClose, onSave, initialBranding, }: BrandingEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=branding_editor.d.ts.map