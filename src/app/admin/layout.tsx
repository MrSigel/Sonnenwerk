import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  // /admin/* ist noindex und ohne Tracking (§17.5).
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper-sunk">{children}</div>;
}
