export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidName = (name) => {
  return name && name.length >= 3;
};

export const isAllFieldsFilled = (fields) => {
  return Object.values(fields).every(field => field && field.trim() !== "");
};

export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const isValidPhone = (phone) => {
  return phone && phone.length >= 10 && /^[0-9]+$/.test(phone);
};

export const validateSignup = (formData) => {
  if (!isValidName(formData.name)) {
    return { valid: false, error: "❌ Name must be at least 3 characters" };
  }

  if (!isValidEmail(formData.email)) {
    return { valid: false, error: "❌ Please enter a valid email" };
  }

  if (!isValidPassword(formData.password)) {
    return { valid: false, error: "❌ Password must be at least 6 characters" };
  }

  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    return { valid: false, error: "❌ Passwords do not match" };
  }

  return { valid: true, error: null };
};

export const validateLogin = (formData) => {
  if (!formData.email || formData.email.trim() === "") {
    return { valid: false, error: "❌ Please enter your email" };
  }

  if (!isValidEmail(formData.email)) {
    return { valid: false, error: "❌ Please enter a valid email" };
  }

  if (!formData.password || formData.password.trim() === "") {
    return { valid: false, error: "❌ Please enter your password" };
  }

  return { valid: true, error: null };
};
