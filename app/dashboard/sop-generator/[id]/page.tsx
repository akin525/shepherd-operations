"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    MapPin,
    Calendar,
    Download,
    Loader2,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// Interface matching the design structure
interface SOPDetails {
    id: string;
    title: string;
    site: string;
    effective_date: string;
    procedure_steps: string[];
    responsibilities: string[];
    emergency_instructions: string[];
}

const SOPDetailsPage = () => {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();

    const [data, setData] = useState<SOPDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !params.id) return;
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/operations/sop-generators/${params.id}`,
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

                // Mock data fallback to match screenshot if API fails
                // setData({
                //     id: "1",
                //     title: "Gate Access Control Procedure",
                //     site: "Dangote Refinery Gate 3",
                //     effective_date: "16 Jan 2026",
                //     procedure_steps: [
                //         "Multiple uncontrolled entry points around the facility",
                //         "Blind spots observed around emergency exit routes"
                //     ],
                //     responsibilities: [
                //         "Multiple uncontrolled entry points around the facility"
                //     ],
                //     emergency_instructions: [
                //         "High volume of visitor traffic during business hours",
                //         "Delivery vehicles enter premises without verification",
                //         "Staff frequently use emergency exits as regular entry points"
                //     ]
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

    if (!data) return <div className="p-8">SOP details not found.</div>;

    // Reusable Top Info Card
    const InfoCard = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
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

    // Reusable List Section Card
    const ListCard = ({ title, items }: { title: string, items: string[] }) => (
        <Card className="border-none shadow-sm bg-white dark:bg-card h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#3A3A3A] dark:text-white">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
                        >
                            {item}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 italic">No items recorded.</p>
                )}
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
                            SOP Preview
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-8">Shows SOP Preview.</p>
                </div>

                <Button
                    variant="outline"
                    className="gap-2 bg-[#FAB435]/10 text-[#E89500] border-none hover:bg-[#FAB435]/20"
                    onClick={() => toast.success("Downloading SOP...")}
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            {/* 1. Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard
                    label="SOP Title"
                    value={data.title}
                    icon={ShieldCheck}
                />
                <InfoCard
                    label="Site"
                    value={data.site}
                    icon={MapPin}
                />
                <InfoCard
                    label="Effective Date"
                    value={data.effective_date}
                    icon={Calendar}
                />
            </div>

            {/* 2. Detailed Content Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Procedure Steps */}
                <ListCard
                    title="Procedure Steps"
                    items={data.procedure_steps}
                />

                {/* Column 2: Responsibilities */}
                <ListCard
                    title="Responsibilities"
                    items={data.responsibilities}
                />

                {/* Column 3: Emergency Instructions */}
                <ListCard
                    title="Emergency Instructions"
                    items={data.emergency_instructions}
                />
            </div>
        </div>
    );
};

export default SOPDetailsPage;