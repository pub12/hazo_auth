export type MessagesConfig = {
    photo_upload_disabled_message: string;
    gravatar_setup_message: string;
    gravatar_no_account_message: string;
    library_tooltip_message: string;
};
/**
 * Reads user-facing messages from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Messages configuration options
 */
export declare function get_messages_config(): MessagesConfig;
//# sourceMappingURL=messages_config.server.d.ts.map