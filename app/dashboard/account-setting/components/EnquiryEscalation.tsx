"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EscalationType, EscalationSchema } from "@/types/escalation";
import { useAuth } from "@/context/AuthContext";

interface StaffMember {
    id: number;
    name: string;
}

interface EscalationCategory {
    id: number;
    name: string;
}

const EnquiryEscalation = () => {
    const { token } = useAuth();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for dynamic data
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [escalationTypes, setEscalationTypes] = useState<EscalationCategory[]>([]);

    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);

    const form = useForm<EscalationType>({
        resolver: zodResolver(EscalationSchema),
        defaultValues: { escalationType: "", staffId: "", description: "" },
    });

    // 1. Fetch Staff List
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/staff`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status) setStaffList(result.data.data);
            } catch (error) {
                console.error("Staff fetch error", error);
            } finally {
                setIsLoadingStaff(false);
            }
        };
        if (token) fetchStaff();
    }, [token]);

    // 2. Fetch Escalation Types
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/escalation-type`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status) setEscalationTypes(result.data);
            } catch (error) {
                console.error("Types fetch error", error);
            } finally {
                setIsLoadingTypes(false);
            }
        };
        if (token) fetchTypes();
    }, [token]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: EscalationType) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("escalation_type", data.escalationType);
            formData.append("staff_identifier", data.staffId);
            formData.append("message", data.description);
            if (data.image) formData.append("image", data.image);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/submit-escalation`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: formData,
            });

            const result = await response.json();
            if (result.status) {
                toast.success("Submitted successfully");
                form.reset();
                setImagePreview(null);
            } else {
                toast.error(result.message || "Submission failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-primary-foreground py-6 rounded-lg shadow-lg w-full">
            <h2 className="text-[16px] font-bold mb-4 px-3 lg:px-6">Escalation</h2>
            <hr className="mb-4" />
            <div className="px-3 lg:px-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">

                        {/* Escalation Type - Dynamically Connected */}
                        <FormField
                            control={form.control}
                            name="escalationType"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Escalation Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder={isLoadingTypes ? "Loading types..." : "Select type"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {escalationTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.name}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Staff Select */}
                        <FormField
                            control={form.control}
                            name="staffId"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Select Operative Member</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder={isLoadingStaff ? "Loading staff..." : "Choose staff member"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {staffList.map((staff) => (
                                                <SelectItem key={staff.id} value={staff.id.toString()}>
                                                    {staff.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image Upload */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={() => (
                                <FormItem className="w-full">
                                    <FormLabel>Upload Image (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative w-full">
                                            {!imagePreview ? (
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-muted/50 transition-all">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">Click to upload PNG or JPG</span>
                                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                                </label>
                                            ) : (
                                                <div className="relative h-48 w-full border rounded-lg overflow-hidden">
                                                    <Image fill src={imagePreview} alt="Preview" className="object-contain" />
                                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setImagePreview(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Message */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Details of the escalation..." rows={5} className="resize-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-[200px] h-12 bg-[#FAB435]/30 text-[#E59300] hover:bg-[#FAB435]/50 font-bold">
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Send Message"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default EnquiryEscalation;