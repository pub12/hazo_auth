// file_description: unit tests for the forgot_password_layout component covering validation logic and form submission
// section: imports
import { describe, it, expect, jest } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordLayout from "@/components/layouts/forgot_password";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: helpers
const render_forgot_password_layout = (props?: Record<string, unknown>) =>
  render(
    React.createElement(ForgotPasswordLayout, {
      image_src: "/globe.svg",
      image_alt: "Alt text",
      data_client: createLayoutDataClient({}),
      ...props,
    }),
  );

// section: test_suite
describe("forgot_password_layout", () => {
  // section: invalid_email_test
  it("marks invalid email addresses as invalid only after blur", () => {
    render_forgot_password_layout();

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
      name: /Submit forgot password form/i,
    });
    expect(submit_button).toBeDisabled();
  });

  // section: form_submission_test
  it("enables submit button when form is valid", () => {
    render_forgot_password_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit forgot password form/i,
    });

    // Initially disabled
    expect(submit_button).toBeDisabled();

    // Fill in valid email
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).not.toBeDisabled();
  });

  // section: cancel_button_test
  it("resets form when cancel button is clicked", () => {
    render_forgot_password_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const cancel_button = screen.getByRole("button", {
      name: /Cancel forgot password form/i,
    });

    // Fill in form
    fireEvent.change(email_input, { target: { value: "user@example.com" } });

    expect(email_input).toHaveValue("user@example.com");

    // Click cancel
    fireEvent.click(cancel_button);

    // Form should be reset
    expect(email_input).toHaveValue("");
  });

  // section: form_submission_test
  it("handles form submission", async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        }),
      }),
    ) as jest.Mock;

    render_forgot_password_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit forgot password form/i,
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
        "/api/hazo_auth/forgot_password",
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
});

