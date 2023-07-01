import bcrypt from "bcrypt";

export async function hashPassword(
  password: string,
  saltRounds: number
): Promise<string> {
  return await bcrypt.hashSync(password, saltRounds);
}
