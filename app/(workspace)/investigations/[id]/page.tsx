import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUserScan } from "@/lib/scanner/persistence";
import { serializeInvestigation } from "@/lib/product-data";
import { InvestigationView } from "@/components/product/investigation-view";
export const metadata: Metadata = { title: "Investigation detail", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function InvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await getUserScan(id, user.id);
  if (!data) notFound();
  return <InvestigationView initial={serializeInvestigation(data, data.evidence, data.providers)}/>;
}
