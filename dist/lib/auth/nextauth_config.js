import GoogleProvider from "next-auth/providers/google";
import { get_oauth_config } from "../oauth_config.server.js";
import { handle_google_oauth_login } from "../services/oauth_service.js";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server.js";
import { create_app_logger } from "../app_logger.js";
// section: config
/**
 * Gets NextAuth.js configuration with enabled OAuth providers
 * Providers are dynamically configured based on hazo_auth_config.ini settings
 * @returns NextAuth configuration object
 */
export function get_nextauth_config() {
    const oauth_config = get_oauth_config();
    const providers = [];
    // Add Google provider if enabled
    if (oauth_config.enable_google) {
        const client_id = process.env.HAZO_AUTH_GOOGLE_CLIENT_ID;
        const client_secret = process.env.HAZO_AUTH_GOOGLE_CLIENT_SECRET;
        if (client_id && client_secret) {
            providers.push(GoogleProvider({
                clientId: client_id,
                clientSecret: client_secret,
                authorization: {
                    params: {
                        prompt: "consent",
                        access_type: "offline",
                        response_type: "code",
                    },
                },
            }));
        }
    }
    return {
        providers,
        pages: {
            // Use hazo_auth login page for sign-in errors
            signIn: "/hazo_auth/login",
            error: "/hazo_auth/login",
        },
        callbacks: {
            /**
             * Redirect callback - controls where users go after authentication
             * We redirect to our custom callback handler to create hazo_auth session
             */
            async redirect({ url, baseUrl }) {
                // Log for debugging
                console.log("[NextAuth redirect callback]", { url, baseUrl });
                // Always redirect to our custom callback after sign-in to set hazo_auth cookies
                // The callbackUrl from signIn() comes through as `url`
                if (url.includes("/api/hazo_auth/oauth/google/callback")) {
                    return url;
                }
                // If URL is relative or same origin, allow it
                if (url.startsWith("/")) {
                    return `${baseUrl}${url}`;
                }
                if (url.startsWith(baseUrl)) {
                    return url;
                }
                // Default: redirect to our custom OAuth callback to set cookies
                return `${baseUrl}/api/hazo_auth/oauth/google/callback`;
            },
            /**
             * Sign-in callback - handle user creation/linking for Google OAuth
             */
            async signIn({ account, profile, user, }) {
                var _a;
                const logger = create_app_logger();
                if ((account === null || account === void 0 ? void 0 : account.provider) === "google" && profile) {
                    try {
                        const googleProfile = profile;
                        const hazoConnect = get_hazo_connect_instance();
                        logger.info("nextauth_google_signin_attempt", {
                            email: user.email,
                            google_id: googleProfile.sub,
                            name: user.name,
                        });
                        // Handle the Google OAuth login (create user or link account)
                        const result = await handle_google_oauth_login(hazoConnect, {
                            google_id: googleProfile.sub || account.providerAccountId,
                            email: user.email || googleProfile.email || "",
                            name: user.name || googleProfile.name || undefined,
                            profile_picture_url: user.image || googleProfile.picture || undefined,
                            email_verified: (_a = googleProfile.email_verified) !== null && _a !== void 0 ? _a : true,
                        });
                        if (!result.success) {
                            logger.error("nextauth_google_signin_failed", {
                                email: user.email,
                                error: result.error,
                            });
                            return false;
                        }
                        logger.info("nextauth_google_signin_success", {
                            user_id: result.user_id,
                            email: result.email,
                            is_new_user: result.is_new_user,
                            was_linked: result.was_linked,
                        });
                        // Store user_id in account for the JWT callback to pick up
                        account.hazo_user_id = result.user_id;
                        return true;
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : "Unknown error";
                        logger.error("nextauth_google_signin_exception", {
                            email: user.email,
                            error: errorMessage,
                        });
                        return false;
                    }
                }
                return true;
            },
            /**
             * JWT callback - add OAuth provider info to the token
             */
            async jwt({ token, account, profile }) {
                if (account && profile) {
                    token.provider = account.provider;
                    token.providerAccountId = account.providerAccountId;
                    // Store hazo_user_id from signIn callback
                    if (account.hazo_user_id) {
                        token.hazo_user_id = account.hazo_user_id;
                    }
                    // For Google, store additional profile data
                    if (account.provider === "google") {
                        const googleProfile = profile;
                        token.google_id = googleProfile.sub;
                        token.email_verified = googleProfile.email_verified;
                    }
                }
                return token;
            },
            /**
             * Session callback - pass provider info to session
             */
            async session({ session, token }) {
                if (token) {
                    const extSession = session;
                    const extToken = token;
                    extSession.provider = extToken.provider;
                    extSession.providerAccountId = extToken.providerAccountId;
                    extSession.google_id = extToken.google_id;
                    extSession.email_verified = extToken.email_verified;
                }
                return session;
            },
        },
        // Use JWT strategy - we don't need a database adapter since we manage users ourselves
        session: {
            strategy: "jwt",
            maxAge: 60 * 10, // 10 minutes - short lived since we create our own session
        },
        // Disable debug in production
        debug: process.env.NODE_ENV === "development",
    };
}
/**
 * Checks if any OAuth providers are configured and enabled
 * @returns true if at least one OAuth provider is available
 */
export function has_oauth_providers() {
    const oauth_config = get_oauth_config();
    if (oauth_config.enable_google) {
        const has_google_credentials = process.env.HAZO_AUTH_GOOGLE_CLIENT_ID &&
            process.env.HAZO_AUTH_GOOGLE_CLIENT_SECRET;
        if (has_google_credentials)
            return true;
    }
    return false;
}
