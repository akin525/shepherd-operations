"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus } from "lucide-react"; // Added Plus icon
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Define the data structure based on your API response
interface Assessment {
    id: number;
    request_id: string;
    client_name: string;
    location: string;
    facility_type: string;
    request_date: string;
    status: "pending" | "in_progress" | "submitted";
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const AssessmentRequests = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<Assessment[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Fetch Data Function
    const fetchAssessments = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
            });
            if (search) params.append("search", search);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operations/assessments?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const result = await response.json();

            if (result.status) {
                setData(result.data.data); // accessing the 'data' array inside the pagination object
                setMeta({
                    current_page: result.data.current_page,
                    last_page: result.data.last_page,
                    per_page: result.data.per_page,
                    total: result.data.total,
                });
            }
        } catch (error) {
            console.error("Error fetching assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search or fetch on dependency change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAssessments();
        }, 500); // 500ms delay for search
        return () => clearTimeout(timer);
    }, [token, page, search]);

    // Helper: Render Status Badge with correct color dot
    const renderStatus = (status: string) => {
        let colorClass = "bg-gray-400"; // default
        let label = status;

        if (status === "pending") colorClass = "bg-yellow-500";
        if (status === "in_progress") colorClass = "bg-blue-500";
        if (status === "submitted") colorClass = "bg-green-500";

        // Format text (e.g., "in_progress" -> "In Progress")
        label = status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

        return (
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${colorClass}`} />
                <span className="text-[#3A3A3A] text-sm font-medium">{label}</span>
            </div>
        );
    };

    // Helper: Render Action Button based on Status
    const renderActionButton = (item: Assessment) => {
        let label = "View";
        let bgClass = "bg-[#FAB435]/20 hover:bg-[#FAB435]/30 text-[#E89500]"; // Default yellow tint style

        if (item.status === "pending") {
            label = "Start";
        } else if (item.status === "in_progress") {
            label = "Continue";
        } else {
            label = "View";
        }

        return (
            <Button
                size="sm"
                className={`${bgClass} border-none font-semibold w-24`}
                onClick={() => router.push(`/dashboard/site-assessments/${item.request_id}`)}
            >
                {label}
            </Button>
        );
    };

    return (
        <div className="space-y-6 mt-8">
            {/* Header Section with Create Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                        Assessment Requests
                    </h1>
                    <p className="text-gray-500">Assessment Requests List</p>
                </div>

                <Button
                    onClick={() => router.push('/dashboard/site-assessments/create')}
                    className="bg-[#FAB435] hover:bg-[#d99820] text-white shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                {/* Search & Filter Bar */}
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    {/* The "Payment Info" tab look-alike from design */}
                    <div className="border-b-2 border-[#FAB435] pb-2 px-1">
                        <span className="font-bold text-[#3A3A3A] dark:text-white">Request List</span>
                    </div>

                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 bg-gray-50 border-gray-200"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900">
                            <TableRow>
                                <TableHead className="font-medium text-gray-500">Request ID</TableHead>
                                <TableHead className="font-medium text-gray-500">Client Name</TableHead>
                                <TableHead className="font-medium text-gray-500">Location</TableHead>
                                <TableHead className="font-medium text-gray-500">Facility Type</TableHead>
                                <TableHead className="font-medium text-gray-500">Request Date</TableHead>
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
                                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                        No assessment requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-bold text-[#3A3A3A] dark:text-white">
                                            {item.request_id}
                                        </TableCell>
                                        <TableCell>{item.client_name}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.facility_type}</TableCell>
                                        <TableCell>{item.request_date}</TableCell>
                                        <TableCell>{renderStatus(item.status)}</TableCell>
                                        <TableCell>{renderActionButton(item)}</TableCell>
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

                                {/* Simple Page Numbers */}
                                {[...Array(Math.min(5, meta.last_page))].map((_, idx) => {
                                    const p = idx + 1; // Logic can be improved for large page numbers
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

export default AssessmentRequests;