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

const CreateManningStructure = () => {
    const { token } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        client_name: "",
        location: "",
        start_date: "",
        total_guards: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.client_name || !formData.location || !formData.start_date || !formData.total_guards) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            // NOTE: Adjust the API endpoint to match your Laravel route
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/manning-structures`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success("Manning structure setup initiated successfully");
                // Redirect to the list or the next step (e.g., configuring shifts)
                router.push("/dashboard/manning-structure");
            } else {
                toast.error(result.message || "Failed to setup manning structure");
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
                    Manning Structure Setup
                </h1>
                <p className="text-gray-500 text-sm">Configure guard deployment for a site</p>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold text-[#3A3A3A] dark:text-white">
                        Setup Form
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/* Client Name (Dropdown or Input depending on implementation) */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Client Name</Label>
                        {/* Using Select as shown in screenshot design pattern */}
                        <Select
                            value={formData.client_name}
                            onValueChange={(val) => handleSelectChange("client_name", val)}
                        >
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Populate dynamically if you have a clients API */}
                                <SelectItem value="Dangote Refinery">Dangote Refinery</SelectItem>
                                <SelectItem value="Zenith Bank HQ">Zenith Bank HQ</SelectItem>
                                <SelectItem value="Shoprite Ikeja">Shoprite Ikeja</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location/Site */}
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

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Start Date</Label>
                        <Input
                            type="date"
                            name="start_date"
                            className="h-12 bg-white block w-full"
                            value={formData.start_date}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Total Guards */}
                    <div className="space-y-2">
                        <Label className="text-[#3A3A3A] font-medium">Total Guards</Label>
                        <Select
                            value={formData.total_guards}
                            onValueChange={(val) => handleSelectChange("total_guards", val)}
                        >
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="Select Amount" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 Guards</SelectItem>
                                <SelectItem value="10">10 Guards</SelectItem>
                                <SelectItem value="15">15 Guards</SelectItem>
                                <SelectItem value="20">20 Guards</SelectItem>
                                <SelectItem value="50">50+ Guards</SelectItem>
                            </SelectContent>
                        </Select>
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

export default CreateManningStructure;