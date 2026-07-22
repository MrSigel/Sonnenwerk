import { requireAdmin } from "@/lib/admin/auth";
import { fetchInvites, fetchPartners } from "@/lib/admin/invites";
import { AdminShell } from "@/components/admin/AdminShell";
import { InviteManager } from "@/components/admin/InviteManager";

export const dynamic = "force-dynamic";

export default async function EinladungenPage() {
  const profile = await requireAdmin();
  const [invites, partners] = await Promise.all([fetchInvites(), fetchPartners()]);

  return (
    <AdminShell profile={profile} active="einladungen">
      <h1 className="text-h2 font-bold tracking-tight text-ink">Einladungen</h1>
      <p className="mt-1 text-small text-ink-soft">
        Erzeugen Sie Einmal-Codes für neue Partner. Jeder Code kann genau einmal zur
        Registrierung verwendet werden.
      </p>
      <div className="mt-6">
        <InviteManager initialInvites={invites} partners={partners} />
      </div>
    </AdminShell>
  );
}
