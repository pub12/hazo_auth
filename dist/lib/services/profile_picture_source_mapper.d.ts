/**
 * UI representation of profile picture source
 * Used in components and API interfaces
 */
export type ProfilePictureSourceUI = "upload" | "library" | "gravatar" | "custom";
/**
 * Database enum values for profile_source
 * Must match the CHECK constraint in the database
 */
export type ProfilePictureSourceDB = "gravatar" | "custom" | "predefined";
/**
 * Maps UI profile picture source to database enum value
 * @param uiSource - UI representation of source ("upload", "library", "gravatar", "custom")
 * @returns Database enum value ("gravatar", "custom", "predefined")
 */
export declare function map_ui_source_to_db(uiSource: ProfilePictureSourceUI): ProfilePictureSourceDB;
/**
 * Maps database enum value to UI representation
 * @param dbSource - Database enum value ("gravatar", "custom", "predefined")
 * @returns UI representation ("upload", "library", "gravatar", "custom")
 */
export declare function map_db_source_to_ui(dbSource: ProfilePictureSourceDB | string | null | undefined): ProfilePictureSourceUI;
//# sourceMappingURL=profile_picture_source_mapper.d.ts.map