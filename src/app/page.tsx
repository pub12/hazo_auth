// file_description: render the default landing page with sidebar navigation to test components
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
} from "@/components/ui/sidebar";
import { LogIn, UserPlus, BookOpen, ExternalLink, Database, KeyRound, MailCheck } from "lucide-react";

// section: page_component
export default function home_page() {
  return (
    <SidebarProvider>
      <div className="cls_home_wrapper flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="cls_home_sidebar_header">
            <div className="cls_home_sidebar_title flex items-center gap-2 px-2 py-4">
              <h1 className="cls_home_sidebar_title_text text-lg font-semibold text-sidebar-foreground">
                hazo auth
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="cls_home_sidebar_content">
            <SidebarGroup className="cls_home_sidebar_test_group">
              <SidebarGroupLabel className="cls_home_sidebar_group_label">
                Test components
              </SidebarGroupLabel>
              <SidebarMenu className="cls_home_sidebar_test_menu">
                <SidebarMenuItem className="cls_home_sidebar_test_login_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/login"
                      className="cls_home_sidebar_test_login_link flex items-center gap-2"
                      aria-label="Test login layout component"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      <span>Test login</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_home_sidebar_test_register_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/register"
                      className="cls_home_sidebar_test_register_link flex items-center gap-2"
                      aria-label="Test register layout component"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      <span>Test register</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_home_sidebar_test_forgot_password_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/forgot_password"
                      className="cls_home_sidebar_test_forgot_password_link flex items-center gap-2"
                      aria-label="Test forgot password layout component"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      <span>Test forgot password</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_home_sidebar_test_email_verification_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/verify_email"
                      className="cls_home_sidebar_test_email_verification_link flex items-center gap-2"
                      aria-label="Test email verification layout component"
                    >
                      <MailCheck className="h-4 w-4" aria-hidden="true" />
                      <span>Test email verification</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_home_sidebar_sqlite_admin_item">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/hazo_connect/sqlite_admin"
                      className="cls_home_sidebar_sqlite_admin_link flex items-center gap-2"
                      aria-label="Open SQLite admin UI to browse and edit database"
                    >
                      <Database className="h-4 w-4" aria-hidden="true" />
                      <span>SQLite Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="cls_home_sidebar_resources_group">
              <SidebarGroupLabel className="cls_home_sidebar_group_label">
                Resources
              </SidebarGroupLabel>
              <SidebarMenu className="cls_home_sidebar_resources_menu">
                <SidebarMenuItem className="cls_home_sidebar_storybook_item">
                  <SidebarMenuButton asChild>
                    <a
                      href="http://localhost:6006"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cls_home_sidebar_storybook_link flex items-center gap-2"
                      aria-label="Open Storybook preview for reusable components"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      <span>Storybook</span>
                      <ExternalLink className="ml-auto h-3 w-3" aria-hidden="true" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="cls_home_sidebar_docs_item">
                  <SidebarMenuButton asChild>
                    <a
                      href="https://ui.shadcn.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cls_home_sidebar_docs_link flex items-center gap-2"
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
        <SidebarInset className="cls_home_sidebar_inset">
          <header className="cls_home_main_header flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="cls_home_sidebar_trigger" />
            <div className="cls_home_main_header_content flex flex-1 items-center gap-2">
              <h2 className="cls_home_main_title text-lg font-semibold text-foreground">
                hazo reusable ui library workspace
              </h2>
            </div>
          </header>
          <main className="cls_home_main_content flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="cls_home_welcome_content flex w-full max-w-3xl flex-col items-center justify-center gap-6">
              <h1 className="cls_home_welcome_title text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Welcome to hazo auth
              </h1>
              <p className="cls_home_welcome_summary text-base leading-relaxed text-muted-foreground md:text-lg">
                Start shaping accessible, shadcn-powered components with integrated
                hazo_config and hazo_connect support. Storybook is pre-installed so
                you can document and iterate on each piece with confidence.
              </p>
              <p className="cls_home_welcome_instruction text-sm text-muted-foreground">
                Use the sidebar to navigate to test components or access resources.
              </p>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
