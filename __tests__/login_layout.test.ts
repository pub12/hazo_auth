// file_description: unit tests for the login_layout component covering validation logic, password toggle, and form submission
// section: imports
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

    const submit_button = screen.getByRole("button", {
      name: /Submit login form/i,
    });
    expect(submit_button).toBeDisabled();
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
  it("enables submit button when form is valid", () => {
    render_login_layout();

    const email_input = screen.getByLabelText("Email address input field");
    const password_input = screen.getByLabelText("Password input field");
    const submit_button = screen.getByRole("button", {
      name: /Submit login form/i,
    });

    // Initially disabled
    expect(submit_button).toBeDisabled();

    // Fill in valid email
    fireEvent.change(email_input, { target: { value: "user@example.com" } });
    expect(submit_button).toBeDisabled(); // Still disabled, password missing

    // Fill in password
    fireEvent.change(password_input, { target: { value: "password123" } });
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
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    render_login_layout({ logger: mockLogger });

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

    // Wait for async operations
    await waitFor(() => {
      // Logger should be called (either info for success or error for failure)
      expect(mockLogger.info).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});

