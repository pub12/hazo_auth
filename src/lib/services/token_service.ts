// file_description: shared service for creating and managing tokens in hazo_refresh_tokens table
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { randomBytes, randomUUID } from "crypto";
import argon2 from "argon2";
import { read_config_section } from "../config/config_loader.server";
import { create_app_logger } from "../app_logger";

// section: types
export type TokenType = "refresh" | "password_reset" | "email_verification";

export type CreateTokenParams = {
  adapter: HazoConnectAdapter;
  user_id: string;
  token_type: TokenType;
};

export type CreateTokenResult = {
  success: boolean;
  raw_token?: string;
  error?: string;
};

// section: helpers
/**
 * Gets token expiry hours from hazo_auth_config.ini for a specific token type
 * Falls back to defaults if config is not found
 * @param token_type - The type of token (refresh, password_reset, email_verification)
 * @returns Number of hours until token expires
 */
function get_token_expiry_hours(token_type: TokenType): number {
  const default_expiries: Record<TokenType, number> = {
    refresh: 720, // 30 days
    password_reset: 0.167, // 10 minutes
    email_verification: 48, // 48 hours
  };

  const logger = create_app_logger();
  const token_config_section = read_config_section("hazo_auth__tokens");

  // Get expiry from config or environment variable or default
  const config_key = `${token_type}_expiry_hours`;
  const env_key = `HAZO_AUTH_${token_type.toUpperCase()}_TOKEN_EXPIRY_HOURS`;

  const expiry_hours =
    token_config_section?.[config_key] ||
    process.env[env_key] ||
    default_expiries[token_type];

  return parseFloat(String(expiry_hours)) || default_expiries[token_type];
}

/**
 * Creates a token for a user and stores it in hazo_refresh_tokens table
 * Invalidates any existing tokens of the same type for the user before creating a new one
 * @param params - Token creation parameters (adapter, user_id, token_type)
 * @returns Token creation result with raw_token (for sending to user) or error
 */
export async function create_token(
  params: CreateTokenParams,
): Promise<CreateTokenResult> {
  try {
    const { adapter, user_id, token_type } = params;

    // Create CRUD service for hazo_refresh_tokens table
    const tokens_service = createCrudService(adapter, "hazo_refresh_tokens");

    // Invalidate any existing tokens of this type for this user
    // If token_type column doesn't exist, this will fail - catch and continue
    let existing_tokens: unknown[] = [];
    try {
      existing_tokens = (await tokens_service.findBy({
        user_id: user_id,
        token_type: token_type,
      })) as unknown[];
    } catch (error) {
      // If token_type column doesn't exist, try without it
      // This is a fallback for databases that haven't had the migration applied
      const logger = create_app_logger();
      const error_message = error instanceof Error ? error.message : "Unknown error";
      logger.warn("token_service_token_type_column_missing", {
        filename: "token_service.ts",
        line_number: 0,
        user_id,
        token_type,
        error: error_message,
        note: "token_type column may not exist, trying without filter",
      });
      // Try to find tokens by user_id only (less precise but works without migration)
      try {
        existing_tokens = (await tokens_service.findBy({
          user_id: user_id,
        })) as unknown[];
      } catch (fallbackError) {
        // If that also fails, log and continue (will just create new token)
        const fallback_error_message = fallbackError instanceof Error ? fallbackError.message : "Unknown error";
        logger.warn("token_service_query_existing_tokens_failed", {
          filename: "token_service.ts",
          line_number: 0,
          user_id,
          error: fallback_error_message,
          note: "Could not query existing tokens, will create new token anyway",
        });
      }
    }

    if (Array.isArray(existing_tokens) && existing_tokens.length > 0) {
      // Delete existing tokens (of this type if token_type exists, or all for user if not)
      for (const token of existing_tokens) {
        try {
          await tokens_service.deleteById((token as { id: unknown }).id);
        } catch (deleteError) {
          const logger = create_app_logger();
          const error_message = deleteError instanceof Error ? deleteError.message : "Unknown error";
          logger.warn("token_service_delete_existing_token_failed", {
            filename: "token_service.ts",
            line_number: 0,
            user_id,
            token_id: (token as { id: unknown }).id,
            error: error_message,
          });
        }
      }
    }

    // Generate a secure random token
    const raw_token = randomBytes(32).toString("hex");

    // Hash the token before storing
    const token_hash = await argon2.hash(raw_token);

    // Get expiry hours from config
    const expiry_hours = get_token_expiry_hours(token_type);

    // Calculate expiration time (convert hours to milliseconds)
    const expires_at = new Date();
    expires_at.setTime(expires_at.getTime() + expiry_hours * 60 * 60 * 1000);

    const now = new Date().toISOString();

    // Insert the token into the database
    // Try with token_type first, fallback to without if column doesn't exist
    let inserted_tokens: unknown[];
    try {
      inserted_tokens = (await tokens_service.insert({
        id: randomUUID(),
        user_id: user_id,
        token_hash: token_hash,
        token_type: token_type,
        expires_at: expires_at.toISOString(),
        created_at: now,
      })) as unknown[];
    } catch (error) {
      // If token_type column doesn't exist, try without it
      const logger = create_app_logger();
      const error_message = error instanceof Error ? error.message : "Unknown error";
      logger.warn("token_service_insert_with_token_type_failed", {
        filename: "token_service.ts",
        line_number: 0,
        user_id,
        token_type,
        error: error_message,
        note: "token_type column may not exist, inserting without it",
      });
      // Fallback: insert without token_type (will use default if column exists with default)
      inserted_tokens = (await tokens_service.insert({
        id: randomUUID(),
        user_id: user_id,
        token_hash: token_hash,
        expires_at: expires_at.toISOString(),
        created_at: now,
      })) as unknown[];
    }

    // Verify insertion was successful
    if (!Array.isArray(inserted_tokens) || inserted_tokens.length === 0) {
      const logger = create_app_logger();
      const error_msg = `Failed to create ${token_type} token - no rows inserted`;
      logger.error("token_service_insertion_failed", {
        filename: "token_service.ts",
        line_number: 0,
        user_id,
        token_type,
        error: error_msg,
      });
      return {
        success: false,
        error: error_msg,
      };
    }

    const logger = create_app_logger();
    logger.info("token_service_token_created", {
      filename: "token_service.ts",
      line_number: 0,
      user_id,
      token_type,
    });
    
    // Log raw token and test URLs in debug mode (logger handles dev mode)
    logger.debug("token_service_raw_token", {
      filename: "token_service.ts",
      line_number: 0,
      user_id,
      token_type,
      raw_token,
      test_url: token_type === "email_verification" 
        ? `/verify_email?token=${raw_token}`
        : token_type === "password_reset"
        ? `/reset_password?token=${raw_token}`
        : undefined,
    });

    return {
      success: true,
      raw_token,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message =
      error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("token_service_create_token_error", {
      filename: "token_service.ts",
      line_number: 0,
      user_id: params.user_id,
      token_type: params.token_type,
      error: error_message,
      error_stack,
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

