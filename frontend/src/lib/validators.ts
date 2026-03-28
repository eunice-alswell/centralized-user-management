// Validation error types
export interface ValidationErrors {
  [key: string]: string;
}

// Email validation
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

// Password validation
export function validatePassword(password: string, minLength = 6): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

// Name validation
export function validateName(name: string): string | null {
  if (!name.trim()) {
    return "Name is required";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  if (name.length > 100) {
    return "Name must not exceed 100 characters";
  }
  return null;
}

// Login form validation
export function validateLoginForm(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password, 1); // Lenient for login
  if (passwordError) errors.password = passwordError;

  return errors;
}

// Create user form validation
export function validateCreateUserForm(
  name: string,
  email: string,
  password: string,
  role: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (!role || (role !== "Admin" && role !== "User")) {
    errors.role = "Please select a valid role";
  }

  return errors;
}

// Helper to check if there are any validation errors
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
