// file_description: service for user login operations using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import argon2 from "argon2";

// section: types
export type LoginData = {
  email: string;
  password: string;
};

export type LoginResult = {
  success: boolean;
  user_id?: string;
  error?: string;
  email_not_verified?: boolean;
};

// section: helpers
/**
 * Authenticates a user by verifying email and password against hazo_users table
 * @param adapter - The hazo_connect adapter instance
 * @param data - Login data (email, password)
 * @returns Login result with success status and user_id or error
 */
export async function authenticate_user(
  adapter: HazoConnectAdapter,
  data: LoginData,
): Promise<LoginResult> {
  try {
    const { email, password } = data;

    // Create CRUD service for hazo_users table
    const users_service = createCrudService(adapter, "hazo_users");

    // Find user by email
    const users = await users_service.findBy({
      email_address: email,
    });

    // Check if user exists
    if (!Array.isArray(users) || users.length === 0) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const user = users[0];

    // Check if user is active
    if (user.is_active === false) {
      return {
        success: false,
        error: "Account is inactive. Please contact support.",
      };
    }

    // Verify password using argon2
    const password_hash = user.password_hash as string;
    const is_password_valid = await argon2.verify(password_hash, password);

    if (!is_password_valid) {
      // Increment login attempts on failed password
      const current_attempts = (user.login_attempts as number) || 0;
      const now = new Date().toISOString();

      await users_service.updateById(
        user.id,
        {
          login_attempts: current_attempts + 1,
          changed_at: now,
        }
      );

      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if email is verified
    const email_verified = user.email_verified as boolean;
    if (!email_verified) {
      return {
        success: false,
        error: "Email address not verified. Please verify your email before logging in.",
        email_not_verified: true,
      };
    }

    // Password is valid and email is verified - update last_logon and reset login_attempts
    const now = new Date().toISOString();
    await users_service.updateById(
      user.id,
      {
        last_logon: now,
        login_attempts: 0,
        changed_at: now,
      }
    );

    return {
      success: true,
      user_id: user.id as string,
    };
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: error_message,
    };
  }
}

