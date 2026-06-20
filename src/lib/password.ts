import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function validatePasswordStrength(plain: string): string | null {
  if (plain.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(plain)) return "Password must include at least one letter";
  if (!/\d/.test(plain)) return "Password must include at least one number";
  return null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
