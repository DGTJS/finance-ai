"use client";

import { useState, useEffect } from "react";
import { getWorkPeriods, getWorkPeriodStats } from "@/app/_actions/work-period";
import { getProjects } from "@/app/_actions/project";
import EntrepreneurClient from "@/app/entrepreneur/_components/entrepreneur-client";

interface FreelancerDashboardProps {
  onClose?: () => void;
}

export function FreelancerDashboard({ onClose }: FreelancerDashboardProps) {
  const [periods, setPeriods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalAmount: 0,
    totalExpenses: 0,
    totalNetProfit: 0,
    periodCount: 0,
    averageHourlyRate: 0,
  });
  const [todayStats, setTodayStats] = useState({
    totalHours: 0,
    totalAmount: 0,
    totalExpenses: 0,
    totalNetProfit: 0,
    periodCount: 0,
    averageHourlyRate: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const [periodsResult, statsResult, todayStatsResult, projectsResult] = await Promise.all([
        getWorkPeriods(startOfMonth, endOfMonth),
        getWorkPeriodStats(startOfMonth, endOfMonth),
        getWorkPeriodStats(startOfToday, endOfToday),
        getProjects(),
      ]);

      if (periodsResult.success) {
        setPeriods(periodsResult.data || []);
      }
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      if (todayStatsResult.success) {
        setTodayStats(todayStatsResult.data);
      }
      if (projectsResult.success) {
        setProjects(projectsResult.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do freelancer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground text-sm">Carregando dados do freelancer...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EntrepreneurClient
        initialPeriods={periods}
        initialStats={stats}
        todayStats={todayStats}
        initialProjects={projects}
        hideHeader={true}
      />
    </div>
  );
}

