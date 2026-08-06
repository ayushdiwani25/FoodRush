// ====================================================
// 🔍 VALIDATION UTILITIES - Simple & Easy
// ====================================================

// Check if email format is valid
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if password is strong enough
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Check if name is valid
export const isValidName = (name) => {
  return name && name.length >= 3;
};

// Check if all form fields are filled
export const isAllFieldsFilled = (fields) => {
  return Object.values(fields).every(field => field && field.trim() !== "");
};

// Check if passwords match
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Check if phone is valid (basic)
export const isValidPhone = (phone) => {
  return phone && phone.length >= 10 && /^[0-9]+$/.test(phone);
};

// Comprehensive signup validation
export const validateSignup = (formData) => {
  // Check: Name
  if (!isValidName(formData.name)) {
    return { valid: false, error: "❌ Name must be at least 3 characters" };
  }

  // Check: Email
  if (!isValidEmail(formData.email)) {
    return { valid: false, error: "❌ Please enter a valid email" };
  }

  // Check: Password
  if (!isValidPassword(formData.password)) {
    return { valid: false, error: "❌ Password must be at least 6 characters" };
  }

  // Check: Passwords match
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    return { valid: false, error: "❌ Passwords do not match" };
  }

  // All good
  return { valid: true, error: null };
};

// Comprehensive login validation
export const validateLogin = (formData) => {
  // Check: Email
  if (!formData.email || formData.email.trim() === "") {
    return { valid: false, error: "❌ Please enter your email" };
  }

  if (!isValidEmail(formData.email)) {
    return { valid: false, error: "❌ Please enter a valid email" };
  }

  // Check: Password
  if (!formData.password || formData.password.trim() === "") {
    return { valid: false, error: "❌ Please enter your password" };
  }

  // All good
  return { valid: true, error: null };
};
