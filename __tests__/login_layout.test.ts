// file_description: unit tests for the login_layout component covering validation logic, password toggle, and form submission
// section: imports
import { describe, it, expect, jest } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginLayout from "@/components/layouts/login";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: helpers
const render_login_layout = (props?: Record<string, unknown>) =>
  render(
    React.createElement(LoginLayout, {
      image_src: "/globe.svg",
      image_alt: "Alt text",
      data_client: createLayoutDataClient({}),
      ...props,
    }),
  );

// section: test_suite
describe("login_layout", () => {
  // section: invalid_email_test
  it("marks invalid email addresses as invalid only after blur", () => {
    render_login_layout();

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

    // Note: Submit button is enabled if any field has content (validation errors don't disable it)
    const submit_button = screen.getByRole("button", {
      name: /Submit login form/i,
    });
    expect(submit_button).not.toBeDisabled();
  });

  // section: password_visibility_toggle_test
  it("supports password visibility toggle", () => {
    render_login_layout();

    const password_input = screen.getByLabelText("Password input field");
    expect(password_input).toHaveAttribute("type", "password");

    const toggle_button = screen.getByLabelText(/Show password/i);
    fireEvent.click(toggle_button);
    expect(password_input).toHaveAttribute("type", "text");

    fireEvent.click(toggle_button);
    expect(password_input).toHaveAttribute("type", "password");
  });

  // section: form_submission_test
  it("disables submit button only when all fields are empty", () => {
    render_login_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const password_input = screen.getByLabelText("Password input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit login form/i,
    });

    // Initially disabled (all fields empty)
    expect(submit_button).toBeDisabled();

    // Fill in email only - button becomes enabled (not all fields empty)
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).not.toBeDisabled();

    // Clear email - button disabled again (all fields empty)
    fireEvent.change(email_input, { target: { value: "" } });
    expect(submit_button).toBeDisabled();

    // Fill in password only - button becomes enabled
    fireEvent.change(password_input, { target: { value: "password123" } });
    expect(submit_button).not.toBeDisabled();

    // Fill both fields - button stays enabled
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).not.toBeDisabled();
  });

  // section: cancel_button_test
  it("resets form when cancel button is clicked", () => {
    render_login_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const password_input = screen.getByLabelText("Password input field");
    const cancel_button = screen.getByRole("button", {
      name: /Cancel login form/i,
    });

    // Fill in form
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    fireEvent.change(password_input, { target: { value: "password123" } });

    expect(email_input).toHaveValue("user@example.com");
    expect(password_input).toHaveValue("password123");

    // Click cancel
    fireEvent.click(cancel_button);

    // Form should be reset
    expect(email_input).toHaveValue("");
    expect(password_input).toHaveValue("");
  });

  // section: form_submission_with_logging_test
  it("handles form submission", async () => {
    // Mock fetch to handle login API call
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, user: { id: "123" } }),
        });
      }
      // Default for other calls like /me
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ authenticated: false }),
      });
    });

    render_login_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const password_input = screen.getByLabelText("Password input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit login form/i,
    });

    // Fill in form
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    fireEvent.change(password_input, { target: { value: "password123" } });

    // Wait for button to be enabled
    await waitFor(() => {
      expect(submit_button).not.toBeDisabled();
    });

    // Submit form
    fireEvent.click(submit_button);

    // Wait for async operations - verify login API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: "POST",
        }),
      );
    }, { timeout: 3000 });
  });
});

