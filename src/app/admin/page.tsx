import { requireProfile } from "@/lib/admin/auth";
import { fetchLeads } from "@/lib/admin/leads";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadTable } from "@/components/admin/LeadTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireProfile();
  const leads = await fetchLeads();

  return (
    <AdminShell profile={profile} active="leads">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-h2 font-bold tracking-tight text-ink">Leads</h1>
        <p className="text-small text-ink-soft">{leads.length} Einträge insgesamt</p>
      </div>
      <div className="mt-6">
        <LeadTable leads={leads} />
      </div>
    </AdminShell>
  );
}
