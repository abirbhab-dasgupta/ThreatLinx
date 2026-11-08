import "@/components/product/product.css";
import "@/components/product/shell.css";
import "@xyflow/react/dist/style.css";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { AppShell } from "@/components/product/app-shell";
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell user={{ name: user.name, email: user.email, isModerator: isAdmin(user) }}>{children}</AppShell>;
}
