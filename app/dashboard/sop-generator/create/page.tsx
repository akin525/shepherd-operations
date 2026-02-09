"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CreateSOP = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sop_title: "",
        client_name: "",
        location: "",
        effective_date: "",
    });

    // Handle Text Inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Select Inputs
    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.sop_title || !formData.client_name || !formData.location || !formData.effective_date) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            // NOTE: Ensure this matches your backend route
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/sop-generators`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success("SOP Basic Information saved successfully");
                // Since the button says "Next", you might want to redirect to a "Step 2" page
                // For now, redirecting to the list view
                router.push("/dashboard/sop-generator");
            } else {
                toast.error(result.message || "Failed to create SOP");
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
                <h1 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                    SOP Setup
                </h1>
                <p className="text-gray-500 text-sm">Create standard operating procedure</p>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold text-[#3A3A3A] dark:text-white">
                        SOP Basic Information
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* SOP Title */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">SOP Title</Label>
                        <Input
                            name="sop_title"
                            placeholder="Enter SOP Title"
                            className="h-12 bg-white"
                            value={formData.sop_title}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Client/Site Name */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Client/Site Name</Label>
                        <Select
                            value={formData.client_name}
                            onValueChange={(val) => handleSelectChange("client_name", val)}
                        >
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="Enter Client/Site Name" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Dynamically populate these from your Clients API */}
                                <SelectItem value="Dangote Refinery">Dangote Refinery</SelectItem>
                                <SelectItem value="Zenith Bank HQ">Zenith Bank HQ</SelectItem>
                                <SelectItem value="Shoprite Ikeja">Shoprite Ikeja</SelectItem>
                                <SelectItem value="MTN Office Lekki">MTN Office Lekki</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Location</Label>
                        <Input
                            name="location"
                            placeholder="Enter Location"
                            className="h-12 bg-white"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Effective Date */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Effective Date</Label>
                        <Input
                            type="date"
                            name="effective_date"
                            className="h-12 bg-white block w-full"
                            value={formData.effective_date}
                            onChange={handleInputChange}
                        />
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
                                    Processing...
                                </>
                            ) : (
                                "Next"
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default CreateSOP;