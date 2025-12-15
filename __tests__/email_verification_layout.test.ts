// file_description: unit tests for the email_verification_layout component covering verification flow, resend form, and redirect behavior
// section: imports
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailVerificationLayout from "@/components/layouts/email_verification";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: helpers
const render_email_verification_layout = (props?: Record<string, unknown>) =>
  render(
    React.createElement(EmailVerificationLayout, {
      image_src: "/globe.svg",
      image_alt: "Alt text",
      data_client: createLayoutDataClient({}),
      ...props,
    }),
  );

// Note: Next.js navigation is mocked globally in jest.setup.ts

// section: test_suite
describe("email_verification_layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch to handle multiple calls - /me endpoint first, then verification endpoints
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        });
      }
      // Default response for other endpoints
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  // section: invalid_email_test
  it("marks invalid email addresses as invalid only after blur in resend form", async () => {
    // Mock fetch to handle verification failure
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        });
      }
      if (url.includes('/verify_email')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Invalid token" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    render_email_verification_layout();

    // Wait for verification to complete and error state to show
    await waitFor(() => {
      expect(screen.queryByText("Verification failed")).toBeInTheDocument();
    });

    const email_input = screen.getByLabelText("Email address input field");
    
    // Error should not appear while typing
    fireEvent.change(email_input, { target: { value: "basad@as" } });
    expect(
      screen.queryByText("enter a valid email address"),
    ).not.toBeInTheDocument();

    // Error should appear after blur
    fireEvent.blur(email_input);
    expect(
      screen.getByText("enter a valid email address"),
    ).toBeInTheDocument();

    const submit_button = screen.getByRole("button", {
      name: /Submit resend verification email form/i,
    });
    expect(submit_button).toBeDisabled();
  });

  // section: resend_form_submission_test
  it("disables submit button when email has validation errors", async () => {
    // Mock fetch to handle verification failure
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        });
      }
      if (url.includes('/verify_email')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Invalid token" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    render_email_verification_layout();

    // Wait for verification to complete and error state to show
    await waitFor(() => {
      expect(screen.queryByText("Verification failed")).toBeInTheDocument();
    });

    const email_input = screen.getByLabelText("Email address input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit resend verification email form/i,
    });

    // Button starts enabled (no errors yet)
    expect(submit_button).not.toBeDisabled();

    // Enter invalid email and blur to trigger validation error
    fireEvent.change(email_input, { target: { value: "invalid-email" } });
    fireEvent.blur(email_input);

    // Button should be disabled with validation error
    expect(submit_button).toBeDisabled();

    // Fill in valid email - button should be enabled again
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).not.toBeDisabled();
  });

  // section: resend_form_submission_test
  it("handles resend form submission", async () => {
    let resendCalled = false;
    // Mock fetch to handle verification failure and then resend success
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        });
      }
      if (url.includes('/verify_email')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Invalid token" }),
        });
      }
      if (url.includes('/resend_verification')) {
        resendCalled = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: "Verification email sent" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    render_email_verification_layout();

    // Wait for verification to complete and error state to show
    await waitFor(() => {
      expect(screen.queryByText("Verification failed")).toBeInTheDocument();
    });

    const email_input = screen.getByLabelText("Email address input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit resend verification email form/i,
    });

    // Fill in form
    fireEvent.change(email_input, { target: { value: "user@example.com" } });

    // Wait for button to be enabled
    await waitFor(() => {
      expect(submit_button).not.toBeDisabled();
    });

    // Submit form
    fireEvent.click(submit_button);

    // Wait for async operations - API path comes from mocked context apiBasePath
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/hazo_auth/resend_verification",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user@example.com",
          }),
        }),
      );
    }, { timeout: 3000 });
  });

  // section: cancel_button_test
  it("has a cancel button that can be clicked", async () => {
    // Mock fetch to handle verification failure
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        });
      }
      if (url.includes('/verify_email')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Invalid token" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    render_email_verification_layout();

    // Wait for verification to complete and error state to show
    await waitFor(() => {
      expect(screen.queryByText("Verification failed")).toBeInTheDocument();
    });

    const cancel_button = screen.getByRole("button", {
      name: /Cancel resend verification email form/i,
    });

    // Verify cancel button exists and can be clicked without error
    expect(cancel_button).toBeInTheDocument();
    fireEvent.click(cancel_button);
    // Note: Router redirect is handled by Next.js navigation which is mocked globally
  });
});

