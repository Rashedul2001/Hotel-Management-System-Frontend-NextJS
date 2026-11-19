import { redirect } from "next/navigation";

export default async function UsersSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "roles") redirect("/pms/users/roles");
  if (section === "permissions") redirect("/pms/users/permissions");
  if (section === "departments") redirect("/pms/users/departments");
  if (section === "assignments") redirect("/pms/users/assignments");
  if (section === "policies") redirect("/pms/users/policies");
  redirect("/pms/users");
}
