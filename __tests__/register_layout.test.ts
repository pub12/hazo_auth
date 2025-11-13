// file_description: unit tests for the register_layout component covering validation logic
// section: imports
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterLayout from "@/components/layouts/register";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: helpers
const render_register_layout = () =>
  render(
    React.createElement(RegisterLayout, {
      image_src: "/globe.svg",
      image_alt: "Alt text",
      data_client: createLayoutDataClient({}),
    }),
  );

// section: test_suite
describe("register_layout", () => {
  // section: invalid_email_test
  it("marks invalid email addresses as invalid only after blur", () => {
    render_register_layout();

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
      name: /Submit registration form/i,
    });
    expect(submit_button).toBeDisabled();
  });

  it("enforces password requirements and supports visibility toggle", () => {
    render(
      React.createElement(RegisterLayout, {
        image_src: "/globe.svg",
        image_alt: "Alt text",
        password_requirements: {
          minimum_length: 12,
          require_uppercase: true,
          require_lowercase: true,
          require_number: true,
          require_special: true,
        },
        data_client: createLayoutDataClient({}),
      }),
    );

    const name_input = screen.getByLabelText("Full name input field");
    const email_input = screen.getByLabelText("Email address input field");
    const password_input = screen.getByLabelText("Password input field");
    const confirm_input = screen.getByLabelText(
      "Re-enter password input field",
    );

    fireEvent.change(password_input, { target: { value: "Short1" } });

    expect(
      screen.getByText(/Password must be at least 12 characters./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Password must include at least one special character./i),
    ).toBeInTheDocument();

    const toggle_button = screen.getByLabelText(/Show password/i);
    fireEvent.click(toggle_button);
    expect(password_input).toHaveAttribute("type", "text");

    fireEvent.change(password_input, {
      target: { value: "ValidPassword12!" },
    });
    fireEvent.change(confirm_input, {
      target: { value: "ValidPassword12!" },
    });
    fireEvent.change(email_input, {
      target: { value: "user@example.com" },
    });
    fireEvent.change(name_input, { target: { value: "Test User" } });

    expect(
      screen.queryByText(/Password must be at least 12 characters./i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();

    const submit_button = screen.getByRole("button", {
      name: /Submit registration form/i,
    });
    expect(submit_button).not.toBeDisabled();
  });
});


