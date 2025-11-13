// file_description: API route to get current authenticated user information
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "@/lib/services/profile_picture_source_mapper";

// section: api_handler
export async function GET(request: NextRequest) {
  try {
    // Get user info from cookies
    const user_id = request.cookies.get("hazo_auth_user_id")?.value;
    const user_email = request.cookies.get("hazo_auth_user_email")?.value;

    if (!user_id || !user_email) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Verify user still exists and is active
    const hazoConnect = get_hazo_connect_instance();
    const users_service = createCrudService(hazoConnect, "hazo_users");
    
    const users = await users_service.findBy({
      id: user_id,
      email_address: user_email,
    });

    if (!Array.isArray(users) || users.length === 0) {
      // User not found - clear cookies
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
      response.cookies.set("hazo_auth_user_email", "", {
        expires: new Date(0),
        path: "/",
      });
      response.cookies.set("hazo_auth_user_id", "", {
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    const user = users[0];

    // Check if user is still active
    if (user.is_active === false) {
      // User is inactive - clear cookies
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
      response.cookies.set("hazo_auth_user_email", "", {
        expires: new Date(0),
        path: "/",
      });
      response.cookies.set("hazo_auth_user_id", "", {
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    // Return user info
    // Map database profile_source to UI representation
    const profile_source_db = user.profile_source as string | null | undefined;
    const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;

    return NextResponse.json(
      {
        authenticated: true,
        user_id: user.id,
        email: user.email_address,
        name: user.name || undefined,
        email_verified: user.email_verified === true,
        last_logon: user.last_logon || undefined,
        profile_picture_url: user.profile_picture_url || undefined,
        profile_source: profile_source_ui,
      },
      { status: 200 }
    );
  } catch (error) {
    // On error, assume not authenticated
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

