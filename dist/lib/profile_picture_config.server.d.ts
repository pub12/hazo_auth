export type ProfilePictureConfig = {
    allow_photo_upload: boolean;
    upload_photo_path?: string;
    max_photo_size: number;
    user_photo_default: boolean;
    user_photo_default_priority1: "gravatar" | "library";
    user_photo_default_priority2?: "library" | "gravatar";
    library_photo_path: string;
};
/**
 * Reads profile picture configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Profile picture configuration options
 */
export declare function get_profile_picture_config(): ProfilePictureConfig;
//# sourceMappingURL=profile_picture_config.server.d.ts.map