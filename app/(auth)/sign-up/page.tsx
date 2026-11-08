import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = { title: "Create account" };
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");
  const params = await searchParams;
  return <AuthScreen providerError={params.error !== undefined} mode="sign-up" googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />;
}
