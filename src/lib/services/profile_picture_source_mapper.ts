// file_description: helper to map between UI profile picture source values and database enum values
// section: types
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

// section: helpers
/**
 * Maps UI profile picture source to database enum value
 * @param uiSource - UI representation of source ("upload", "library", "gravatar", "custom")
 * @returns Database enum value ("gravatar", "custom", "predefined")
 */
export function map_ui_source_to_db(uiSource: ProfilePictureSourceUI): ProfilePictureSourceDB {
  switch (uiSource) {
    case "upload":
      return "custom"; // User uploaded their own photo
    case "library":
      return "predefined"; // User selected from predefined library
    case "gravatar":
      return "gravatar"; // User's Gravatar
    case "custom":
      return "custom"; // Already in database format
    default:
      // Fallback to custom for unknown values
      return "custom";
  }
}

/**
 * Maps database enum value to UI representation
 * @param dbSource - Database enum value ("gravatar", "custom", "predefined")
 * @returns UI representation ("upload", "library", "gravatar", "custom")
 */
export function map_db_source_to_ui(dbSource: ProfilePictureSourceDB | string | null | undefined): ProfilePictureSourceUI {
  if (!dbSource) {
    return "custom"; // Default fallback
  }

  switch (dbSource) {
    case "gravatar":
      return "gravatar";
    case "custom":
      return "upload"; // Map custom to upload in UI (user uploaded their own)
    case "predefined":
      return "library"; // Map predefined to library in UI (user selected from library)
    default:
      // For unknown values, try to return as-is if it matches UI format
      if (dbSource === "upload" || dbSource === "library") {
        return dbSource as ProfilePictureSourceUI;
      }
      return "custom"; // Fallback
  }
}

