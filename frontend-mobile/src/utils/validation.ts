/**
 * Validation utility functions
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Iranian phone number validation
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Enhanced validation for Iranian mobile numbers with error message
 * @param phone The phone number to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateIranianMobileNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'شماره موبایل الزامی است' };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'فرمت شماره موبایل صحیح نیست' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validateNumeric = (value: string, fieldName: string): string | null => {
  if (isNaN(Number(value))) {
    return `${fieldName} must be a valid number`;
  }
  return null;
};

export const validatePositiveNumber = (value: number, fieldName: string): string | null => {
  if (value <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

export const validateFileSize = (file: File, maxSizeInMB: number): string | null => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return `File size must be less than ${maxSizeInMB}MB`;
  }
  return null;
};

export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateIranianNationalId = (nationalId: string): boolean => {
  if (!/^\d{10}$/.test(nationalId)) {
    return false;
  }
  
  const check = parseInt(nationalId[9]);
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nationalId[i]) * (10 - i);
  }
  
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
};










