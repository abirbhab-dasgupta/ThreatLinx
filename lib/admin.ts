                                                                             
export function isAdmin(user: { email: string; emailVerified?: boolean }) {
  const emails = (process.env.ADMIN_EMAILS ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return user.emailVerified === true && emails.includes(user.email.toLowerCase());
}
