"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, Download, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Type definitions matching the PHP 'data' array structure
interface AssessmentDetails {
    header: {
        request_id: string;
        client_name: string;
        site_name: string;
        site_address: string;
        facility_type: string;
    };
    details: {
        assessment_date: string;
        assessment_time: string;
        assessed_by: string;
        status: string;
    };
    requirements: {
        guard_strength: string;
        cadre_type: string;
        armed_police: string;
        shift_pattern: string;
    };
    risks: string[];
    observations: string[];
}

const AssessmentDetailsPage = () => {
    const { token } = useAuth();
    const params = useParams(); // Get ID from URL
    const router = useRouter();

    const [data, setData] = useState<AssessmentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !params.id) return;
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/operations/assessments/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const result = await response.json();

                if (result.status) {
                    setData(result.data);
                } else {
                    toast.error("Failed to load details");
                }
            } catch (error) {
                console.error("Error fetching details:", error);
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

    if (!data) return <div className="p-8">Assessment not found.</div>;

    // Reusable Component for the Top 4 Cards
    const InfoCard = ({ label, value }: { label: string; value: string }) => (
        <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-lg bg-[#FAB435]/10 p-3">
                    <ShieldCheck className="h-6 w-6 text-[#FAB435]" />
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -ml-2"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                            Assessment Details
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-8">
                        Request ID: {data.header.request_id}
                    </p>
                </div>
                <Button variant="outline" className="gap-2 bg-[#FAB435]/10 text-[#E89500] border-none hover:bg-[#FAB435]/20">
                    <Download className="h-4 w-4" />
                    Download Report
                </Button>
            </div>

            {/* 1. Top Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Client name" value={data.header.client_name} />
                <InfoCard label="Site Name" value={data.header.site_name} />
                <InfoCard label="Site Address" value={data.header.site_address} />
                <InfoCard label="Facility Type" value={data.header.facility_type} />
            </div>

            {/* 2. More Details Section */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">More details</h3>
                    <div className="space-y-4">
                        <DetailRow label="Assessment Date" value={data.details.assessment_date} />
                        <DetailRow label="Assessment Time" value={data.details.assessment_time} />
                        <DetailRow label="Assessed By" value={data.details.assessed_by} />
                        <DetailRow label="Request ID" value={data.header.request_id} />
                        <DetailRow label="Assessment Status" value={data.details.status} />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Guard Requirement Section */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">Guard Requirement</h3>
                    <div className="space-y-6">
                        <RequirementItem label="Recommended Guard Strength" value={data.requirements.guard_strength} />
                        <RequirementItem label="Cadre Type" value={data.requirements.cadre_type || "Standard"} />
                        <RequirementItem label="Armed Police Required" value={data.requirements.armed_police} />
                        <RequirementItem label="Shift Pattern" value={data.requirements.shift_pattern} />
                    </div>
                </CardContent>
            </Card>

            {/* 4. Risks & Observations Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Risks */}
                <Card className="border-none shadow-sm h-full">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">Security Risks Identified</h3>
                        <ul className="space-y-4">
                            {data.risks.length > 0 ? (
                                data.risks.map((risk, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                        {risk}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 text-sm">No risks recorded.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* General Observations */}
                <Card className="border-none shadow-sm h-full">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">General Observations</h3>
                        <ul className="space-y-4">
                            {data.observations.length > 0 ? (
                                data.observations.map((obs, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                        {obs}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 text-sm">No observations recorded.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- Sub-Components for cleaner code ---

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50 last:border-0">
        <span className="text-sm font-bold text-[#3A3A3A] dark:text-white w-48">{label}:</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
    </div>
);

const RequirementItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start gap-3">
        <Star className="h-5 w-5 text-[#FAB435] fill-current shrink-0 mt-0.5" />
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-[#3A3A3A] dark:text-white">{value}</p>
        </div>
    </div>
);

export default AssessmentDetailsPage;