import { DashboardContent } from "@/components/pms/dashboard/dashboard-content";

export const metadata = {
  title: "Dashboard · Hotel Velora PMS",
  description:
    "Real-time property management command center for Hotel Velora. Monitor room inventory, check-in velocity, housekeeping, and revenue analytics.",
};

export default function PMSDashboardPage() {
  return <DashboardContent />;
}
