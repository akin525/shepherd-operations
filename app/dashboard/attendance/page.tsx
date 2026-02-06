"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Clock,
    UserX,
    UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Types based on your API Response structure
interface Stats {
    guards_scheduled: number;
    guards_on_duty: number;
    late_clock_ins: number;
    absent_guards: number;
}

interface Employee {
    id: number;
    name: string;
    location: string;
    shift: string;
    clock_in: string;
    clock_out: string;
    status: string;
    status_color: string; // e.g., "text-green-600"
    avatar: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const AttendancePage = () => {
    const { token } = useAuth();

    // State
    const [stats, setStats] = useState<Stats | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Fetch Data
    const fetchAttendance = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
            });
            if (search) params.append("search", search);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operations/attendance?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const result = await response.json();

            if (result.status) {
                setStats(result.data.stats);
                setEmployees(result.data.attendance_list.data);
                setMeta({
                    current_page: result.data.attendance_list.current_page,
                    last_page: result.data.attendance_list.last_page,
                    per_page: result.data.attendance_list.per_page,
                    total: result.data.attendance_list.total,
                });
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce Search & Pagination
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAttendance();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, page, search]);

    // Reusable Stat Card Component
    const StatCard = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
        <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#FAB435]/10">
                    <Icon className="h-6 w-6 text-[#FAB435]" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-[#3A3A3A] dark:text-white mt-1">
                        {loading ? "-" : value}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 mt-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                    Attendance
                </h1>
                <p className="text-gray-500">Breakdown of Staff Attendance on site</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Guards Scheduled Today"
                    value={stats?.guards_scheduled || 0}
                    icon={ShieldCheck}
                />
                <StatCard
                    label="Guards On Duty"
                    value={stats?.guards_on_duty || 0}
                    icon={UserCheck}
                />
                <StatCard
                    label="Late Clock-ins"
                    value={stats?.late_clock_ins || 0}
                    icon={Clock}
                />
                <StatCard
                    label="Absent Guards"
                    value={stats?.absent_guards || 0}
                    icon={UserX}
                />
            </div>

            {/* Main Content Card */}
            <Card className="border-none shadow-sm bg-white dark:bg-card">
                {/* Search & Filter Header */}
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="border-b-2 border-[#FAB435] pb-2 px-1">
                        <span className="font-bold text-[#3A3A3A] dark:text-white">Attendance Overview</span>
                    </div>

                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 bg-gray-50 border-gray-200"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900">
                            <TableRow>
                                <TableHead className="font-medium text-gray-500">Name</TableHead>
                                <TableHead className="font-medium text-gray-500">Location</TableHead>
                                <TableHead className="font-medium text-gray-500">Shift</TableHead>
                                <TableHead className="font-medium text-gray-500">Clock-In</TableHead>
                                <TableHead className="font-medium text-gray-500">Clock-Out</TableHead>
                                <TableHead className="font-medium text-gray-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FAB435]" />
                                    </TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow key={employee.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-bold text-[#3A3A3A] dark:text-white">
                                            {employee.name}
                                        </TableCell>
                                        <TableCell>{employee.location}</TableCell>
                                        <TableCell>{employee.shift}</TableCell>
                                        <TableCell>{employee.clock_in}</TableCell>
                                        <TableCell>{employee.clock_out}</TableCell>
                                        <TableCell>
                        <span className={`font-medium ${employee.status_color}`}>
                            {employee.status}
                        </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!loading && meta && meta.total > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                    Showing {((meta.current_page - 1) * meta.per_page) + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} entries
                </span>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {/* Simplified Pagination logic */}
                                {[...Array(Math.min(5, meta.last_page))].map((_, idx) => {
                                    const p = idx + 1;
                                    return (
                                        <Button
                                            key={p}
                                            variant={page === p ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setPage(p)}
                                            className={`h-8 w-8 ${page === p ? "bg-[#FAB435] hover:bg-[#d99820] text-white" : "text-gray-500"}`}
                                        >
                                            {p}
                                        </Button>
                                    )
                                })}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === meta.last_page}
                                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendancePage;