"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    Download,
    Loader2,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Star
} from "lucide-react";
import Image from "next/image";

// Types matching your API response
interface IncidentDetails {
    header: {
        id: string;
        type: string;
        status: string;
        location: string;
        date_time: string;
    };
    description: {
        what_happened: string;
        how_it_happened: string;
        action_taken: string;
    };
    reporter: {
        name: string;
        site: string;
        timestamp: string;
    };
    evidence: string[]; // Array of image URLs/paths
}

const IncidentDetailsPage = () => {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();

    const [data, setData] = useState<IncidentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Accordion States
    const [openSection, setOpenSection] = useState({
        what: true,
        how: false,
        action: false
    });

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !params.id) return;
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/operations/incidents/${params.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const result = await response.json();
                if (result.status) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [token, params.id]);

    if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FAB435]" /></div>;
    if (!data) return <div className="p-8">Incident not found.</div>;

    // Reusable Top Info Card
    const InfoCard = ({ label, value }: { label: string, value: string }) => (
        <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-[#FAB435]/10 p-3">
                    <ShieldCheck className="h-6 w-6 text-[#FAB435]" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                    <h3 className="text-lg font-bold text-[#3A3A3A] dark:text-white mt-1">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 mt-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">Incident Details</h1>
                    <p className="text-gray-500 text-sm">Incident ID: {data.header.id}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button variant="outline" className="gap-2 bg-[#FAB435]/10 text-[#E89500] border-none hover:bg-[#FAB435]/20">
                        <Download className="h-4 w-4" /> Download
                    </Button>
                </div>
            </div>

            {/* 1. Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Incident type" value={data.header.type} />
                <InfoCard label="Status" value={data.header.status} />
                <InfoCard label="Location" value={data.header.location} />
                <InfoCard label="Date & time" value={data.header.date_time} />
            </div>

            {/* 2. Description Sections (Accordion Style) */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-[#3A3A3A]">Incident Description</h3>

                    {/* Section: What Happened */}
                    <div className="border-b pb-4">
                        <div
                            className="flex justify-between items-center cursor-pointer py-2"
                            onClick={() => setOpenSection(p => ({...p, what: !p.what}))}
                        >
                            <span className="font-semibold text-sm">What happened</span>
                            {openSection.what ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                        {openSection.what && (
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">
                                {data.description.what_happened}
                            </p>
                        )}
                    </div>

                    {/* Section: How it Happened */}
                    <div className="border-b pb-4">
                        <div
                            className="flex justify-between items-center cursor-pointer py-2"
                            onClick={() => setOpenSection(p => ({...p, how: !p.how}))}
                        >
                            <span className="font-semibold text-sm">How it happened</span>
                            {openSection.how ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                        {openSection.how && (
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">{data.description.how_it_happened}</p>
                        )}
                    </div>

                    {/* Section: Action Taken */}
                    <div className="">
                        <div
                            className="flex justify-between items-center cursor-pointer py-2"
                            onClick={() => setOpenSection(p => ({...p, action: !p.action}))}
                        >
                            <span className="font-semibold text-sm">Immediate action taken</span>
                            {openSection.action ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                        {openSection.action && (
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">{data.description.action_taken}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Location & Reporter Info */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">Location & Reporter Info</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-[#FAB435] fill-current" />
                            <div>
                                <p className="text-xs text-gray-400">Site</p>
                                <p className="text-sm font-bold">{data.reporter.site}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-[#FAB435] fill-current" />
                            <div>
                                <p className="text-xs text-gray-400">Reporting Guard Name</p>
                                <p className="text-sm font-bold">{data.reporter.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-[#FAB435] fill-current" />
                            <div>
                                <p className="text-xs text-gray-400">Timestamp</p>
                                <p className="text-sm font-bold">{data.reporter.timestamp}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Evidence */}
            <div>
                <h3 className="text-lg font-bold text-[#3A3A3A] mb-4">Evidence</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {data.evidence && data.evidence.length > 0 ? (
                        data.evidence.map((photo, index) => (
                            <Card key={index} className="border-none shadow-sm overflow-hidden">
                                <div className="bg-white p-3 border-b text-sm font-semibold text-center">
                                    Evidence Photo {index + 1}
                                </div>
                                <div className="relative h-48 w-full bg-gray-100">
                                    {/* Ensure your API returns full URLs or handle the path properly */}
                                    <Image
                                        src={photo.startsWith('http') ? photo : `${process.env.NEXT_PUBLIC_API_URL}/storage/${photo}`}
                                        alt={`Evidence ${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No evidence photos attached.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailsPage;