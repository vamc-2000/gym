 export function validatePassword(password: string) {
  const minLength = 8;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  if (password.length < minLength) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!hasUpper) {
    throw new Error("Password must include at least one uppercase letter");
  }

  if (!hasLower) {
    throw new Error("Password must include at least one lowercase letter");
  }

  if (!hasNumber) {
    throw new Error("Password must include at least one number");
  }

  if (!hasSpecial) {
    throw new Error("Password must include at least one special character");
  }
}