/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";


const NewplanSchema = z.object({
    service: z.string().min(1, "Service is required"),
    numOfStaff: z.string().min(1, "Number of staff is required"),
    location: z.string().min(1, "Location is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
});

type NewPlanType = z.infer<typeof NewplanSchema>;


interface AddNewServiceprop {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddNewService = ({ open, onOpenChange }: AddNewServiceprop) => {
    const [isLoading, setIsLoading] = useState(false);
    const {token} = useAuth()

    const form = useForm<NewPlanType>({
        resolver: zodResolver(NewplanSchema),
        defaultValues: {
            service: "",
            numOfStaff: "",
            location: "",
            start_date: "",
            end_date: "",
        },
    });

    const onSubmit = async (data: NewPlanType) => {
        setIsLoading(true);
        try {
            

            const payload = {
                service: data.service,
                staff_count: parseInt(data.numOfStaff),
                location: data.location,
                start_date: data.start_date,
                end_date: data.end_date,
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/client/request-service`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to request service");
            }

            if (result.status) {
                toast.success(result.message || "Plan requested successfully");
                form.reset();
                onOpenChange(false);
            } else {
                toast.error(result.message || "Something went wrong");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="dark:border dark:border-white sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Request New Service</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Service */}
                        <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-full">
                                            <SelectItem value="Premium Guards">Premium Guards</SelectItem>
                                            <SelectItem value="Elite Guards">Elite Guards</SelectItem>
                                            <SelectItem value="Regular Guards">Regular Guards</SelectItem>
                                            <SelectItem value="Supervisors">Supervisors</SelectItem>
                                            <SelectItem value="Bouncers">Bouncers</SelectItem>
                                            <SelectItem value="Carpark Marshalls">Carpark Marshalls</SelectItem>
                                            <SelectItem value="Contracts Manager">Contracts Manager</SelectItem>
                                            <SelectItem value="Control Room Manager">Control Room Manager</SelectItem>
                                            <SelectItem value="Armed Policemen">Armed Policemen</SelectItem>
                                            <SelectItem value="Hotel">Hotel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Staff Count */}
                        <FormField
                            control={form.control}
                            name="numOfStaff"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Staff</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 5" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Start Date - NATIVE INPUT */}
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="block w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* End Date - NATIVE INPUT */}
                        <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="block w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FAB435]/30 text-[#E59300] hover:bg-[#FAB435]/50 mt-4"
                        >
                            {isLoading ? "Requesting..." : "Submit Request"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddNewService;