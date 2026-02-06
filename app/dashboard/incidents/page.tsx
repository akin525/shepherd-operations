"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Plus // Added Plus icon
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

// Interfaces
interface Incident {
    id: number;
    incident_id: string;
    type: string;
    location: string;
    date_time: string;
    reported_by: string;
    status: string; // Display string e.g. "Under Review"
    raw_status: string; // Key e.g. "under_review"
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const IncidentsPage = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<Incident[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchIncidents = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
            });
            if (search) params.append("search", search);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operations/incidents?${params.toString()}`,
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
            console.error("Error loading incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchIncidents();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, page, search]);

    return (
        <div className="space-y-6 mt-8">
            {/* Header with Create Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">Incidents</h1>
                    <p className="text-gray-500">Report of incidents on site</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/incidents/create')}
                    className="bg-[#FAB435] hover:bg-[#d99820] text-white shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create New
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
                                <TableHead className="font-medium text-gray-500">Incident ID</TableHead>
                                <TableHead className="font-medium text-gray-500">Incident Type</TableHead>
                                <TableHead className="font-medium text-gray-500">Location</TableHead>
                                <TableHead className="font-medium text-gray-500">Date & Time</TableHead>
                                <TableHead className="font-medium text-gray-500">Reported By</TableHead>
                                <TableHead className="font-medium text-gray-500">Status</TableHead>
                                <TableHead className="font-medium text-gray-500">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FAB435]" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">No incidents found.</TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-bold text-[#3A3A3A] dark:text-white">{item.incident_id}</TableCell>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.date_time}</TableCell>
                                        <TableCell>{item.reported_by}</TableCell>
                                        <TableCell>
                                            {/* Status Logic based on raw_status key */}
                                            <span className={`font-medium ${
                                                item.raw_status === 'resolved' ? 'text-green-600' :
                                                    item.raw_status === 'escalated' ? 'text-red-600' :
                                                        item.raw_status === 'closed' ? 'text-gray-500' :
                                                            'text-orange-500' // under_review
                                            }`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                className="bg-[#FAB435]/20 hover:bg-[#FAB435]/30 text-[#E89500] border-none font-semibold w-20"
                                                onClick={() => router.push(`/dashboard/incidents/${item.incident_id}`)}
                                            >
                                                View
                                            </Button>
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
                                {[...Array(Math.min(5, meta.last_page))].map((_, idx) => (
                                    <Button
                                        key={idx + 1}
                                        variant={page === idx + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setPage(idx + 1)}
                                        className={`h-8 w-8 ${page === idx + 1 ? "bg-[#FAB435] text-white" : "text-gray-500"}`}
                                    >
                                        {idx + 1}
                                    </Button>
                                ))}
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

export default IncidentsPage;