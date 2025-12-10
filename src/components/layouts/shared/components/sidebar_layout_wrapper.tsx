// file_description: shared sidebar layout wrapper for auth pages to ensure consistent navigation
// section: client_directive
"use client";

// section: imports
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../../../ui/sidebar";
import { LogIn, UserPlus, BookOpen, ExternalLink, Database, KeyRound, MailCheck, Key, User, ShieldCheck, CircleUserRound } from "lucide-react";
import { use_auth_status } from "../hooks/use_auth_status";
import { ProfilePicMenu } from "./profile_pic_menu";

// section: types
type SidebarLayoutWrapperProps = {
  children: React.ReactNode;
};

// section: component
export function SidebarLayoutWrapper({ children }: SidebarLayoutWrapperProps) {
  const authStatus = use_auth_status();

  return (
    <SidebarProvider>
      <div className="cls_sidebar_layout_wrapper flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="cls_sidebar_layout_header">
            <div className="cls_sidebar_layout_title flex items-center gap-2 px-2 py-4">
              <h1 className="cls_sidebar_layout_title_text text-lg font-semibold text-sidebar-foreground">
                hazo auth
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="cls_sidebar_layout_content">
            <SidebarGroup className="cls_sidebar_layout_test_group">
              <SidebarGroupLabel className="cls_sidebar_layout_group_label">
                Test components
              </SidebarGroupLabel>
              <SidebarMenu className="cls_sidebar_layout_test_menu">
                <SidebarMenuItem className="cls_sidebar_layout_test_login_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/login"
                      className="cls_sidebar_layout_test_login_link flex items-center gap-2"
                      aria-label="Test login layout component"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      <span>Test login</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_test_register_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/register"
                      className="cls_sidebar_layout_test_register_link flex items-center gap-2"
                      aria-label="Test register layout component"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      <span>Test register</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_test_forgot_password_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/forgot_password"
                      className="cls_sidebar_layout_test_forgot_password_link flex items-center gap-2"
                      aria-label="Test forgot password layout component"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      <span>Test forgot password</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_test_reset_password_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/reset_password"
                      className="cls_sidebar_layout_test_reset_password_link flex items-center gap-2"
                      aria-label="Test reset password layout component"
                    >
                      <Key className="h-4 w-4" aria-hidden="true" />
                      <span>Test reset password</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_test_email_verification_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/verify_email"
                      className="cls_sidebar_layout_test_email_verification_link flex items-center gap-2"
                      aria-label="Test email verification layout component"
                    >
                      <MailCheck className="h-4 w-4" aria-hidden="true" />
                      <span>Test email verification</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_sqlite_admin_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_connect/sqlite_admin"
                      className="cls_sidebar_layout_sqlite_admin_link flex items-center gap-2"
                      aria-label="Open SQLite admin UI to browse and edit database"
                    >
                      <Database className="h-4 w-4" aria-hidden="true" />
                      <span>SQLite Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_user_management_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/user_management"
                      className="cls_sidebar_layout_user_management_link flex items-center gap-2"
                      aria-label="Open User Management to manage users, roles, and permissions"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_rbac_test_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/rbac_test"
                      className="cls_sidebar_layout_rbac_test_link flex items-center gap-2"
                      aria-label="Test RBAC and HRBAC access control"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <span>RBAC/HRBAC Test</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_profile_stamp_test_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_auth/profile_stamp_test"
                      className="cls_sidebar_layout_profile_stamp_test_link flex items-center gap-2"
                      aria-label="Test ProfileStamp component"
                    >
                      <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                      <span>ProfileStamp Test</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            {/* Profile menu in sidebar variant - shows user info and account actions */}
            <ProfilePicMenu 
              variant="sidebar" 
              avatar_size="sm"
              className="cls_sidebar_layout_profile_menu"
              sidebar_group_label="Account"
            />
            <SidebarGroup className="cls_sidebar_layout_resources_group">
              <SidebarGroupLabel className="cls_sidebar_layout_group_label">
                Resources
              </SidebarGroupLabel>
              <SidebarMenu className="cls_sidebar_layout_resources_menu">
                <SidebarMenuItem className="cls_sidebar_layout_storybook_item">
                  <SidebarMenuButton asChild>
                    <a
                      href="http://localhost:6006"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cls_sidebar_layout_storybook_link flex items-center gap-2"
                      aria-label="Open Storybook preview for reusable components"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      <span>Storybook</span>
                      <ExternalLink className="ml-auto h-3 w-3" aria-hidden="true" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_sidebar_layout_docs_item">
                  <SidebarMenuButton asChild>
                    <a
                      href="https://ui.shadcn.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cls_sidebar_layout_docs_link flex items-center gap-2"
                      aria-label="Review shadcn documentation for styling guidance"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      <span>Shadcn docs</span>
                      <ExternalLink className="ml-auto h-3 w-3" aria-hidden="true" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="cls_sidebar_layout_inset">
          <header className="cls_sidebar_layout_main_header flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="cls_sidebar_layout_trigger" />
            <div className="cls_sidebar_layout_main_header_content flex flex-1 items-center gap-2">
              <h2 className="cls_sidebar_layout_main_title text-lg font-semibold text-foreground">
                hazo reusable ui library workspace
              </h2>
            </div>
            <ProfilePicMenu className="cls_sidebar_layout_auth_status" avatar_size="sm" />
          </header>
          <main className="cls_sidebar_layout_main_content flex flex-1 items-center justify-center p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

