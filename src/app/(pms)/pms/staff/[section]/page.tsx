import { redirect } from "next/navigation";

export default async function StaffSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "profiles") redirect("/pms/staff/profiles");
  if (section === "departments") redirect("/pms/staff/departments");
  if (section === "designations") redirect("/pms/staff/designations");
  if (section === "assignments") redirect("/pms/staff/assignments");
  if (section === "employment-status") redirect("/pms/staff/employment-status");
  redirect("/pms/staff");
}
