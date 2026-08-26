export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  return username && username.trim().length >= 3;
};

export const validatePhoneNumber = (phone) => {
  if (!phone || !String(phone).trim()) return false;
  const cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
  const re = /^(\+?\d{10,15})$/;
  return re.test(cleaned);
};

