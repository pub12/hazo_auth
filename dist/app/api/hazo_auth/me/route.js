// file_description: API route to get current authenticated user information
// section: imports
import { NextResponse } from "next/server";
import { get_authenticated_user_with_response } from "../../../../lib/auth/auth_utils.server";
// section: api_handler
export async function GET(request) {
    try {
        // Use centralized auth utility
        const { auth_result, response } = await get_authenticated_user_with_response(request);
        // If response is provided, it means cookies were cleared (invalid auth)
        if (response) {
            return response;
        }
        // If not authenticated, return false
        if (!auth_result.authenticated) {
            return NextResponse.json({ authenticated: false }, { status: 200 });
        }
        // Return user info
        return NextResponse.json({
            authenticated: true,
            user_id: auth_result.user_id,
            email: auth_result.email,
            name: auth_result.name,
            email_verified: auth_result.email_verified,
            last_logon: auth_result.last_logon,
            profile_picture_url: auth_result.profile_picture_url,
            profile_source: auth_result.profile_source,
        }, { status: 200 });
    }
    catch (error) {
        // On error, assume not authenticated
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }
}
