"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Paperclip, Loader2, X } from "lucide-react";
import { toast } from "sonner";

// Type for Clients dropdown
interface Client {
    id: number;
    name: string;
}

const CreateAssessment = () => {
    const { token } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    // Field States
    const [clientId, setClientId] = useState("");
    const [address, setAddress] = useState("");
    const [facilityType, setFacilityType] = useState("");
    const [date, setDate] = useState("");
    const [requirements, setRequirements] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 1. Fetch Clients for the Dropdown
    useEffect(() => {
        const fetchClients = async () => {
            if (!token) return;
            try {

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?role=client`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status) {
                    setClients(result.data);
                }
            } catch (error) {
                console.error("Failed to load clients");
            }
        };
        fetchClients();
    }, [token]);

    // 2. Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Basic validation (Max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit.");
                return;
            }
            setSelectedFile(file);
        }
    };

    // 3. Handle Form Submission
    const handleSubmit = async () => {
        if (!clientId || !address || !facilityType) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("client_id", clientId);
            formData.append("site_address", address);
            formData.append("facility_type", facilityType);
            if (date) formData.append("assessment_date", date);
            if (requirements) formData.append("guard_requirements", requirements);
            if (selectedFile) formData.append("photo", selectedFile);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/assessments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,

                     },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success("Assessment request saved successfully!");
                router.push("/dashboard/site-assessments"); // Redirect to list
            } else {
                toast.error(result.message || "Failed to save assessment.");
                // Handle validation errors if present
                if (result.errors) {
                    console.log(result.errors);
                }
            }

        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">Site Assessment</h1>
                <p className="text-gray-500 text-sm">Site Assessment Form</p>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold text-[#3A3A3A] dark:text-white">
                        Site Assessment Form
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* Client Dropdown */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Client</Label>
                        <Select onValueChange={setClientId} value={clientId}>
                            <SelectTrigger className="bg-white border-gray-200 h-12">
                                <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.length > 0 ? (
                                    clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-gray-500">No clients found</div>
                                )}
                                {/* Fallback for testing if API fails */}
                                <SelectItem value="1">Zenith Bank (Demo)</SelectItem>
                                <SelectItem value="2">Dangote Depot (Demo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Site Address */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Site Address</Label>
                        <Input
                            placeholder="Enter Address"
                            className="h-12 bg-white border-gray-200"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* Facility Type */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Facility Type</Label>
                        <Select onValueChange={setFacilityType} value={facilityType}>
                            <SelectTrigger className="bg-white border-gray-200 h-12">
                                <SelectValue placeholder="Select Facility Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Corporate Office">Corporate Office</SelectItem>
                                <SelectItem value="Industrial Facility">Industrial Facility</SelectItem>
                                <SelectItem value="Retail Mall">Retail Mall</SelectItem>
                                <SelectItem value="Residential Estate">Residential Estate</SelectItem>
                                <SelectItem value="Warehouse">Warehouse</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assessment Date */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Assessment Date</Label>
                        <Input
                            type="date"
                            className="h-12 bg-white border-gray-200 block w-full"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Guard Requirements */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Guard Requirements</Label>
                        <Input
                            placeholder="Describe Guard Requirement"
                            className="h-12 bg-white border-gray-200"
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                        />
                    </div>

                    {/* Photo Upload Area */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Photo upload</Label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleFileChange}
                            />

                            {selectedFile ? (
                                <div className="flex items-center gap-2 text-[#FAB435]">
                                    <Paperclip className="h-5 w-5" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-transparent text-gray-400 hover:text-red-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            if(fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Paperclip className="h-5 w-5" />
                                    <span className="text-sm">Upload photo (JPG)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            variant="ghost"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#FAB435]/20 hover:bg-[#FAB435]/30 text-[#E89500] font-medium px-6 border-none"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save progress"
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default CreateAssessment;