import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EntrepreneurClient from "./_components/entrepreneur-client";
import { getWorkPeriods, getWorkPeriodStats } from "@/app/_actions/work-period";
import { getProjects } from "@/app/_actions/project";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelancer | Finance AI",
  description: "Gerencie seus períodos de trabalho e ganhos",
};

const EntrepreneurPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar períodos do mês atual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Buscar períodos de hoje
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [periodsResult, statsResult, todayStatsResult, projectsResult] = await Promise.all([
    getWorkPeriods(startOfMonth, endOfMonth),
    getWorkPeriodStats(startOfMonth, endOfMonth),
    getWorkPeriodStats(startOfToday, endOfToday),
    getProjects(),
  ]);

  const periods = periodsResult.success ? periodsResult.data || [] : [];
  const stats = statsResult.success ? statsResult.data : {
    totalHours: 0,
    totalAmount: 0,
    totalExpenses: 0,
    totalNetProfit: 0,
    periodCount: 0,
    averageHourlyRate: 0,
  };
  const todayStats = todayStatsResult.success ? todayStatsResult.data : {
    totalHours: 0,
    totalAmount: 0,
    totalExpenses: 0,
    totalNetProfit: 0,
    periodCount: 0,
    averageHourlyRate: 0,
  };
  const projects = projectsResult.success ? projectsResult.data || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Client Component */}
        <EntrepreneurClient
          initialPeriods={periods}
          initialStats={stats}
          todayStats={todayStats}
          initialProjects={projects}
        />
      </div>
    </div>
  );
};

export default EntrepreneurPage;

