"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Paperclip, Loader2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const CreatePatrolLog = () => {
    const { token } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guard_name: "",
        location: "",
        patrol_area: "",
        patrol_date: "",
        patrol_time: "",
        observation: "",
        incident_found: "false", // String for Select component
        incident_description: ""
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.guard_name || !formData.location || !formData.patrol_area || !formData.patrol_date || !formData.patrol_time) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (formData.incident_found === "true" && !formData.incident_description) {
            toast.error("Please provide an incident description.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            // Append standard fields
            Object.entries(formData).forEach(([key, value]) => {
                // Convert 'incident_found' string to boolean-like integer (1 or 0) for backend validation
                if (key === 'incident_found') {
                    data.append(key, value === "true" ? "1" : "0");
                } else {
                    data.append(key, value);
                }
            });

            // Append Files
            selectedFiles.forEach((file) => {
                data.append("evidence[]", file);
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/patrol-logs`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success("Patrol report submitted successfully");
                router.push("/dashboard/patrol-updates");
            } else {
                toast.error(result.message || "Failed to submit report");
                if (result.errors) console.log(result.errors);
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
                <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">New Patrol Updates</h1>
                <p className="text-gray-500 text-sm">Record patrol activity</p>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold text-[#3A3A3A] dark:text-white">
                        New Patrol Updates
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* Guard Name */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Guard Name</Label>
                        <Input
                            name="guard_name"
                            placeholder="Enter Guard Name"
                            className="h-12 bg-white"
                            value={formData.guard_name}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Location/Site</Label>
                        <Input
                            name="location"
                            placeholder="Enter Location"
                            className="h-12 bg-white"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Patrol Area */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Patrol Area</Label>
                        <Input
                            name="patrol_area"
                            placeholder="e.g. Parking Lot, Warehouse, Main Entrance"
                            className="h-12 bg-white"
                            value={formData.patrol_area}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Date & Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#3A3A3A] font-medium">Patrol Date</Label>
                            <Input
                                type="date"
                                name="patrol_date"
                                className="h-12 bg-white block w-full"
                                value={formData.patrol_date}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#3A3A3A] font-medium">Patrol Time</Label>
                            <Input
                                type="time"
                                name="patrol_time"
                                className="h-12 bg-white block w-full"
                                value={formData.patrol_time}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Observation */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Patrol Observation</Label>
                        <Input
                            name="observation"
                            placeholder="Area secure, no suspicious activity observed."
                            className="h-12 bg-white"
                            value={formData.observation}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Incident Found Toggle */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Incident Found?</Label>
                        <Select
                            value={formData.incident_found}
                            onValueChange={(val) => handleSelectChange("incident_found", val)}
                        >
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Conditional Incident Description */}
                    {formData.incident_found === "true" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-[#3A3A3A] font-medium">Incident Description</Label>
                            <Input
                                name="incident_description"
                                placeholder="Briefly Describe incident"
                                className="h-12 bg-white"
                                value={formData.incident_description}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* Upload Evidence */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Upload Evidence</Label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <div className="flex items-center gap-2 text-gray-400">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">Upload photo(s) or video(s) (JPG, MP4, MOV)</span>
                            </div>
                        </div>

                        {/* File Previews */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                                            <UploadCloud className="h-4 w-4 text-[#FAB435]" />
                                            <span className="truncate max-w-xs">{file.name}</span>
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
                                    Submitting...
                                </>
                            ) : (
                                "Submit Patrol Report"
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default CreatePatrolLog;