"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Headercontent from "@/components/Headercontent";
import DateTimeDisplay from "@/components/DateTime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  Loader2
} from "lucide-react";

// Types matching your getDashboardData API response
interface DashboardData {
  stats: {
    assigned_locations: number;
    active_guards: number;
    incidents_today: number;
  };
  attendance_chart: {
    day: string;
    rate: number;
    present: number;
    total: number;
  }[];
  recent_activities: {
    id: string;
    description: string;
    time: string;
    type: string;
  }[];
}

const Overview = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data from your Laravel API
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/operations/dashboard`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
        );
        const result = await response.json();
        if (result.status) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // --- Reusable Stat Card Component ---
  const StatCard = ({ icon: Icon, label, value, color }: any) => (
      <Card className="border-none shadow-sm flex-1">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`p-4 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
            </h3>
          </div>
        </CardContent>
      </Card>
  );

  return (
      <div className="space-y-6 mt-8 pb-10">
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Headercontent
              title="Welcome"
              subTitle={user?.name || "Admin"}
              description="Start with a clear overview of what matters most"
          />
          <div className="hidden md:block">
            <DateTimeDisplay />
          </div>
        </div>

        {/* 2. Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
              icon={ShieldCheck}
              label="Assigned Locations"
              value={data?.stats.assigned_locations || 0}
              color="bg-orange-100 text-orange-500" // Gold/Yellow theme
          />
          <StatCard
              icon={Users}
              label="Active Guards"
              value={data?.stats.active_guards || 0}
              color="bg-orange-100 text-orange-500"
          />
          <StatCard
              icon={AlertTriangle}
              label="Incidents Today"
              value={data?.stats.incidents_today || 0}
              color="bg-orange-100 text-orange-500"
          />
        </div>

        {/* 3. Middle Section: Chart & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

          {/* Left: Attendance Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Attendance Rate</CardTitle>
                <p className="text-sm text-gray-500">Average attendance rate of employees</p>
              </div>
              <div className="text-3xl font-bold text-[#3A3A3A] dark:text-white">
                {/* Calculate average of the rates in the array */}
                {data?.attendance_chart
                    ? Math.round(data.attendance_chart.reduce((a, b) => a + b.rate, 0) / data.attendance_chart.length)
                    : 0}%
              </div>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              {isLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.attendance_chart} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                          cursor={{ fill: 'transparent' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                  <div className="bg-white p-3 shadow-lg rounded-lg border text-sm">
                                    <p className="font-bold mb-1">{payload[0].payload.day}</p>
                                    <p className="text-green-600">Present: {payload[0].payload.present}</p>
                                    <p className="text-gray-500">Total: {payload[0].payload.total}</p>
                                  </div>
                              );
                            }
                            return null;
                          }}
                      />
                      {/* Gold Bar for 'Rate' */}
                      <Bar dataKey="rate" fill="#FAB435" radius={[4, 4, 0, 0]} />
                      {/* Grey Bar representing 'Absent' gap (optional visual style from image) */}
                      <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} stackId="a" hide />
                    </BarChart>
                  </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Right: Recent Activities */}
          <Card className="col-span-1 border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {isLoading ? (
                    <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin" /></div>
                ) : data?.recent_activities.map((activity, i) => (
                    <div
                        key={i}
                        className="flex items-start justify-between p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {activity.description}
                    </span>
                        <span className="text-xs text-gray-400 capitalize">
                      {activity.type.replace('_', ' ')}
                    </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {activity.time}
                  </span>
                    </div>
                ))}
                {(!data?.recent_activities || data.recent_activities.length === 0) && (
                    <div className="p-6 text-center text-gray-500 text-sm">No recent activities</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
  );
};

export default Overview;
