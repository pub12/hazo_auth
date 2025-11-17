// file_description: define the root layout wrapper for the hazo_auth project
import type { Metadata } from "next";
import local_font from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// section: typography_setup
const geist_sans = local_font({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geist_mono = local_font({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// section: metadata_definition
export const metadata: Metadata = {
  title: "hazo reusable ui components",
  description:
    "Storybook-ready Next.js workspace for building reusable components powered by shadcn.",
};

// section: root_layout_component
export default function root_layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist_sans.variable} ${geist_mono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
