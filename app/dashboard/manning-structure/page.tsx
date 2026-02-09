"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Plus
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

// Interface for Manning Structure Data
interface ManningStructure {
    id: number;
    client_name: string;
    location: string;
    guards_count: number;
    shifts_count: number;
    start_date: string; // Formatted date string
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const ManningStructurePage = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<ManningStructure[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Fetch Data Function
    const fetchManningStructures = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
            });
            if (search) params.append("search", search);

            // Ensure this endpoint exists in your Laravel API
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operations/manning-structures?${params.toString()}`,
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
            console.error("Error fetching manning structures:", error);
            // Fallback/Mock data for demonstration if API isn't ready
            // setData([
            //   { id: 1, client_name: 'Dangote Refinery', location: 'Lekki FTZ', guards_count: 12, shifts_count: 2, start_date: '01 Feb 2026' },
            //   { id: 2, client_name: 'Zenith Bank HQ', location: 'Victoria Island', guards_count: 9, shifts_count: 2, start_date: '10 Jan 2026' },
            // ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchManningStructures();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, page, search]);

    return (
        <div className="space-y-6 mt-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                        Manning Structure Overview
                    </h1>
                    <p className="text-gray-500">Shows all configured manning structures.</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/manning-structure/create')}
                    className="bg-[#FAB435] hover:bg-[#d99820] text-white shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                {/* Search & Filter Bar */}
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="border-b-2 border-[#FAB435] pb-2 px-1">
                        <span className="font-bold text-[#3A3A3A] dark:text-white">Overview</span>
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
                                <TableHead className="font-medium text-gray-500">Client Name</TableHead>
                                <TableHead className="font-medium text-gray-500">Location/Site</TableHead>
                                <TableHead className="font-medium text-gray-500">Guards</TableHead>
                                <TableHead className="font-medium text-gray-500">Shifts</TableHead>
                                <TableHead className="font-medium text-gray-500">Start Date</TableHead>
                                <TableHead className="font-medium text-gray-500">Action</TableHead>
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
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        No manning structures found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-bold text-[#3A3A3A] dark:text-white">
                                            {item.client_name}
                                        </TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.guards_count}</TableCell>
                                        <TableCell>{item.shifts_count}</TableCell>
                                        <TableCell>{item.start_date}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                className="bg-[#FAB435]/20 hover:bg-[#FAB435]/30 text-[#E89500] border-none font-semibold w-20"
                                                onClick={() => router.push(`/dashboard/manning-structure/${item.id}`)}
                                            >
                                                View
                                            </Button>
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

export default ManningStructurePage;