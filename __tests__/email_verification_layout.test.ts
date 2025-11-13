// file_description: unit tests for the email_verification_layout component covering verification flow, resend form, and redirect behavior
// section: imports
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

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "token") {
        return "test-token-123";
      }
      return null;
    },
  }),
}));

// section: test_suite
describe("email_verification_layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // section: invalid_email_test
  it("marks invalid email addresses as invalid only after blur in resend form", async () => {
    // Mock verification to fail so we see the error state with resend form
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid token" }),
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
  it("enables submit button when resend form is valid", async () => {
    // Mock verification to fail so we see the error state with resend form
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid token" }),
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

    // Initially disabled
    expect(submit_button).toBeDisabled();

    // Fill in valid email
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).not.toBeDisabled();
  });

  // section: resend_form_submission_test
  it("handles resend form submission", async () => {
    // Mock verification to fail so we see the error state with resend form
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Verification email sent",
        }),
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

    // Wait for async operations
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/resend_verification",
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
  it("redirects to login when cancel button is clicked", async () => {
    // Mock verification to fail so we see the error state with resend form
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid token" }),
    });

    render_email_verification_layout();

    // Wait for verification to complete and error state to show
    await waitFor(() => {
      expect(screen.queryByText("Verification failed")).toBeInTheDocument();
    });

    const cancel_button = screen.getByRole("button", {
      name: /Cancel resend verification email form/i,
    });

    // Click cancel
    fireEvent.click(cancel_button);

    // Should redirect to login
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});

