// file_description: service for user registration operations using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import argon2 from "argon2";
import { randomUUID } from "crypto";
import { create_token } from "./token_service";
import { get_default_profile_picture } from "./profile_picture_service";
import { get_profile_picture_config } from "../profile_picture_config.server";
import { map_ui_source_to_db } from "./profile_picture_source_mapper";
import { create_app_logger } from "../app_logger";
import { send_template_email } from "./email_service";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { get_filename, get_line_number } from "../utils/api_route_helpers";

// section: types
export type RegistrationData = {
  email: string;
  password: string;
  name?: string;
  url_on_logon?: string;
};

export type RegistrationResult = {
  success: boolean;
  user_id?: string;
  error?: string;
};

// section: helpers
/**
 * Registers a new user in the database using hazo_connect
 * @param adapter - The hazo_connect adapter instance
 * @param data - Registration data (email, password, optional name)
 * @returns Registration result with success status and user_id or error
 */
export async function register_user(
  adapter: HazoConnectAdapter,
  data: RegistrationData,
): Promise<RegistrationResult> {
  try {
    const { email, password, name, url_on_logon } = data;

    // Create CRUD service for hazo_users table
    const users_service = createCrudService(adapter, "hazo_users");

    // Check if user already exists
    const existing_users = await users_service.findBy({
      email_address: email,
    });

    if (Array.isArray(existing_users) && existing_users.length > 0) {
      return {
        success: false,
        error: "Email address already registered",
      };
    }

    // Hash password using argon2
    const password_hash = await argon2.hash(password);

    // Generate user ID
    const user_id = randomUUID();
    const now = new Date().toISOString();

    // Insert user into database using CRUD service
    const insert_data: Record<string, unknown> = {
      id: user_id,
      email_address: email,
      password_hash: password_hash,
      email_verified: false,
      is_active: true,
      login_attempts: 0,
      auth_providers: "email", // Track that this user registered with email/password
      created_at: now,
      changed_at: now,
    };

    // Include name if provided
    if (name) {
      insert_data.name = name;
    }

    // Validate and include url_on_logon if provided
    if (url_on_logon) {
      // Ensure it's a relative path starting with / but not //
      if (url_on_logon.startsWith("/") && !url_on_logon.startsWith("//")) {
        insert_data.url_on_logon = url_on_logon;
      }
    }

    // Set default profile picture if enabled
    const profile_picture_config = get_profile_picture_config();
    if (profile_picture_config.user_photo_default) {
      const default_photo = await get_default_profile_picture(email, name);
      if (default_photo) {
        insert_data.profile_picture_url = default_photo.profile_picture_url;
        // Map UI source value to database enum value
        insert_data.profile_source = map_ui_source_to_db(default_photo.profile_source);
      }
    }

    const inserted_users = await users_service.insert(insert_data);

    // Verify insertion was successful
    if (!Array.isArray(inserted_users) || inserted_users.length === 0) {
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // Create email verification token for the new user
    const token_result = await create_token({
      adapter,
      user_id,
      token_type: "email_verification",
    });

    if (!token_result.success) {
      // Log error but don't fail registration - token can be resent later
      const logger = create_app_logger();
      const error_message = token_result.error || "Unknown error";
      logger.error("registration_service_token_creation_failed", {
        filename: "registration_service.ts",
        line_number: 0,
        user_id,
        error: error_message,
        note: "This may be due to missing token_type column in hazo_refresh_tokens table. Please ensure migration 001_add_token_type_to_refresh_tokens.sql has been applied.",
      });
    } else {
      const logger = create_app_logger();
      logger.info("registration_service_token_created", {
        filename: "registration_service.ts",
        line_number: 0,
        user_id,
      });
    }

    // Send verification email if token was created successfully
    if (token_result.success && token_result.raw_token) {
      const email_result = await send_template_email("email_verification", email, {
        token: token_result.raw_token,
        user_email: email,
        user_name: name,
      });
      
      if (!email_result.success) {
        const logger = create_app_logger();
        logger.error("registration_service_email_send_failed", {
          filename: "registration_service.ts",
          line_number: 0,
          user_id,
          email,
          error: email_result.error,
          note: "User registration succeeded but verification email failed to send",
        });
      }
    }

    return {
      success: true,
      user_id,
    };
  } catch (error) {
    const logger = create_app_logger();
    const user_friendly_error = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "registration_service.ts",
        line_number: get_line_number(),
        email: data.email,
        operation: "register_user",
      },
    });

    return {
      success: false,
      error: user_friendly_error,
    };
  }
}

