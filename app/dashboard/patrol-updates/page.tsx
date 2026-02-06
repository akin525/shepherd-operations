"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Plus,
    Eye
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

// Interface matching the transformed data from your API
interface PatrolLog {
    id: number;
    date_time: string;
    guard_name: string;
    location: string;
    patrol_area: string;
    observation: string;
    status: string;
    is_escalated: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const PatrolLogsPage = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<PatrolLog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchLogs = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
            });
            if (search) params.append("search", search);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operations/patrol-logs?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const result = await response.json();
            if (result.status) {
                setData(result.data.data);
                setMeta({
                    current_page: result.data.current_page,
                    last_page: result.data.last_page,
                    per_page: result.data.per_page,
                    total: result.data.total,
                });
            }
        } catch (error) {
            console.error("Error loading logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, page, search]);

    return (
        <div className="space-y-6 mt-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">Patrol Logs</h1>
                    <p className="text-gray-500">Monitor guard patrol activities across locations</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/patrol-updates/create')}
                    className="bg-[#FAB435] hover:bg-[#d99820] text-white shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Update
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="border-b-2 border-[#FAB435] pb-2 px-1">
                        <span className="font-bold text-[#3A3A3A] dark:text-white">Incidents List</span>
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
                                <TableHead className="font-medium text-gray-500">Date & Time</TableHead>
                                <TableHead className="font-medium text-gray-500">Guard Name</TableHead>
                                <TableHead className="font-medium text-gray-500">Location</TableHead>
                                <TableHead className="font-medium text-gray-500">Patrol Area</TableHead>
                                <TableHead className="font-medium text-gray-500">Observation</TableHead>
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
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">No patrol logs found.</TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="text-[#3A3A3A] dark:text-gray-300">{item.date_time}</TableCell>
                                        <TableCell className="font-bold text-[#3A3A3A] dark:text-white">{item.guard_name}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.patrol_area}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={item.observation}>{item.observation}</TableCell>
                                        <TableCell>
                      <span className={`font-medium ${item.is_escalated ? 'text-red-600' : 'text-green-600'}`}>
                        {item.status}
                      </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {!loading && meta && meta.total > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                    Showing {((meta.current_page - 1) * meta.per_page) + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} entries
                </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="icon" disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))} className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline" size="icon" disabled={page === meta.last_page}
                                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} className="h-8 w-8"
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

export default PatrolLogsPage;