"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    MapPin,
    Calendar,
    Users,
    Download,
    Loader2,
    ArrowLeft
} from "lucide-react";

// Interface matching the design
interface ManningDetails {
    id: string;
    client_name: string;
    location: string;
    start_date: string;
    total_guards: number;
    shift_setup: {
        number_of_shifts: string; // e.g., "2 shifts"
        shift_duration: string;   // e.g., "12-hour shifts"
        shift_timings: string;    // e.g., "6AM–6PM / 6PM–6AM"
    };
}

const ManningStructureDetailsPage = () => {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();

    const [data, setData] = useState<ManningDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !params.id) return;
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/operations/manning-structures/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const result = await response.json();
                if (result.status) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Error fetching details:", error);

                // Mock data fallback for display purposes if API is not ready
                // setData({
                //     id: "1",
                //     client_name: "Zenith Bank PLC",
                //     location: "Zenith Bank Head Office, Ikeja",
                //     start_date: "16 Jan 2026",
                //     total_guards: 14,
                //     shift_setup: {
                //         number_of_shifts: "2 shifts",
                //         shift_duration: "12-hour shifts",
                //         shift_timings: "6AM–6PM / 6PM–6AM"
                //     }
                // });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token, params.id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FAB435]" />
            </div>
        );
    }

    if (!data) return <div className="p-8">Manning structure not found.</div>;

    // Reusable Info Card Component
    const InfoCard = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
        <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-[#FAB435]/10 p-3">
                    <Icon className="h-6 w-6 text-[#FAB435]" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                    <h3 className="text-lg font-bold text-[#3A3A3A] dark:text-white mt-1">
                        {value}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 mt-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="-ml-2 h-8 w-8 text-gray-500"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                            Manning Structure Details
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-8">Details of manning structures.</p>
                </div>

                <Button
                    variant="outline"
                    className="gap-2 bg-[#FAB435]/10 text-[#E89500] border-none hover:bg-[#FAB435]/20"
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            {/* 1. Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                    label="Client Name"
                    value={data.client_name}
                    icon={ShieldCheck}
                />
                <InfoCard
                    label="Location"
                    value={data.location}
                    icon={MapPin}
                />
                <InfoCard
                    label="Start Date"
                    value={data.start_date}
                    icon={Calendar}
                />
                <InfoCard
                    label="Total Guards"
                    value={data.total_guards}
                    icon={Users}
                />
            </div>

            {/* 2. Shift Setup Section */}
            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#3A3A3A] dark:text-white mb-4">
                        Shift Setup
                    </h3>
                    <div className="space-y-4">
                        {/* Row 1 */}
                        <div className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-[#3A3A3A] dark:text-gray-200">
                                {data.shift_setup.number_of_shifts}
                            </p>
                        </div>
                        {/* Row 2 */}
                        <div className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-[#3A3A3A] dark:text-gray-200">
                                {data.shift_setup.shift_duration}
                            </p>
                        </div>
                        {/* Row 3 */}
                        <div className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-[#3A3A3A] dark:text-gray-200 uppercase">
                                {data.shift_setup.shift_timings}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManningStructureDetailsPage;