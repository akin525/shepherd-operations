"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Paperclip, Loader2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const ReportIncidentPage = () => {
    const { token } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guard_name: "",
        incident_type: "",
        incident_date: "",
        location: "",
        description: "",
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Handle Text Inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle File Selection (Supports multiple files)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Basic validation: Check sizes (e.g., 5MB limit per file)
            const validFiles = newFiles.filter(file => {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (Max 5MB)`);
                    return false;
                }
                return true;
            });

            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    // Remove a selected file
    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit Handler
    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.guard_name || !formData.incident_type || !formData.location || !formData.description || !formData.incident_date) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("guard_name", formData.guard_name);
            data.append("incident_type", formData.incident_type);
            data.append("incident_date", formData.incident_date);
            data.append("location", formData.location);
            data.append("description", formData.description);

            // Append multiple files with array notation 'photos[]'
            selectedFiles.forEach((file) => {
                data.append("photos[]", file);
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/incidents`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success("Incident reported successfully");
                router.push("/dashboard/incidents");
            } else {
                toast.error(result.message || "Failed to report incident");
                if (result.errors) {
                    console.error("Validation Errors:", result.errors);
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">Incidents</h1>
                <p className="text-gray-500 text-sm">Report of incidents on site</p>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold text-[#3A3A3A] dark:text-white">
                        Report Incident
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* Guard Name */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Guard name</Label>
                        <Input
                            name="guard_name"
                            placeholder="Enter Reporting Guard Name"
                            className="h-12 bg-white border-gray-200"
                            value={formData.guard_name}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Incident Type */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Incident type</Label>
                        <Input
                            name="incident_type"
                            placeholder="Enter Incident Type"
                            className="h-12 bg-white border-gray-200"
                            value={formData.incident_type}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Incident Date */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Incident Date</Label>
                        <Input
                            type="date"
                            name="incident_date"
                            className="h-12 bg-white border-gray-200 block w-full"
                            value={formData.incident_date}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Location</Label>
                        <Input
                            name="location"
                            placeholder="Enter Location"
                            className="h-12 bg-white border-gray-200"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Description</Label>
                        <Input
                            name="description"
                            placeholder="Describe the Incident"
                            className="h-12 bg-white border-gray-200"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Attach Photos */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Attach Photos</Label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                multiple // Allows multiple photo selection
                                onChange={handleFileChange}
                            />
                            <div className="flex items-center gap-2 text-gray-400">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">Upload photo (JPG)</span>
                            </div>
                        </div>

                        {/* Selected Files Preview List */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                                            <UploadCloud className="h-4 w-4 text-[#FAB435]" />
                                            <span className="truncate max-w-xs">{file.name}</span>
                                            <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    Reporting...
                                </>
                            ) : (
                                "Report Incident"
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default ReportIncidentPage;