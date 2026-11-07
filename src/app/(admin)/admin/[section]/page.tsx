import { AdminSection } from "@/components/temp/admin-section";

const sections: Record<string, { title: string; description: string; type: 'rooms' | 'guests' | 'staff' | 'reservations' | 'housekeeping' | 'maintenance' | 'reports' | 'settings' }> = {
  guests: { title: 'Guests', description: 'View guest profiles, stay history, and preferences.', type: 'guests' },
  staff: { title: 'Staff', description: 'Manage your people, departments, roles, and duty status.', type: 'staff' },
  reservations: { title: 'Reservations', description: 'Admin view of upcoming stays, blocks, and booking activity.', type: 'reservations' },
  housekeeping: { title: 'Housekeeping', description: 'Coordinate room turns, assignments, and service standards.', type: 'housekeeping' },
  maintenance: { title: 'Maintenance', description: 'Track work orders, assets, and property issues.', type: 'maintenance' },
  reports: { title: 'Reports', description: 'Explore performance, revenue, occupancy, and operational reports.', type: 'reports' },
  settings: { title: 'Settings', description: 'Configure property preferences, permissions, and integrations.', type: 'settings' },
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const config = sections[section] ?? sections.rooms
  return <AdminSection {...config} />
}
