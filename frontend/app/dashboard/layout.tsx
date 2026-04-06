import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto premium-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}
