"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResetPasswordSchema, ResetPasswordType } from "@/types/changePassword";
import { changePassword } from "@/actions/signin";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

// Define the steps enum for clarity
enum Steps {
    SEND_OTP = 1,
    VERIFY_OTP = 2,
    CHANGE_PASSWORD = 3,
}

const ChangePassword = () => {
    const { token, user } = useAuth(); // Assuming 'user' has the email
    const [currentStep, setCurrentStep] = useState<Steps>(Steps.SEND_OTP);
    const [isLoading, setIsLoading] = useState(false);


    const [otp, setOtp] = useState("");


    const form = useForm<ResetPasswordType>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleSendOtp = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/send-otp`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            // Mock success for demonstration
            // const response = { ok: true };

            if (response.ok) {
                toast.success("OTP sent to your email address");
                setCurrentStep(Steps.VERIFY_OTP);
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Network error sending OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            toast.error("Please enter a valid OTP");
            return;
        }
        setIsLoading(true);
        try {
            // TODO: Replace with your actual API endpoint to verify OTP
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ otp }),
            });

            // Mock success for demonstration
            // const response = { ok: true };

            if (response.ok) {
                toast.success("Identity verified successfully");
                setCurrentStep(Steps.CHANGE_PASSWORD);
            } else {
                toast.error("Invalid OTP. Please check and try again.");
            }
        } catch (error) {
            toast.error("Error verifying OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 3: Change Password (Original Logic)
    const onSubmit = async (data: ResetPasswordType) => {
        if (!token) {
            toast.error("Please sign in to change password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await changePassword(
                {
                    current_password: data.currentPassword,
                    new_password: data.newPassword,
                    new_password_confirmation: data.confirmPassword,
                },
                token
            );

            if (response.statusCode === 200 || response.statusCode === 201) {
                toast.success(response.message || "Password changed successfully");
                form.reset();
                // Optional: Reset to step 1 after success?
                // setCurrentStep(Steps.SEND_OTP);
            } else {
                toast.error(response.error || "Failed to change password");
            }
        } catch (error) {
            console.error("Password change error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-primary-foreground rounded-lg py-6 shadow-lg min-h-[400px]">
            <div className="px-3 lg:px-6 mb-4 flex justify-between items-center">
                <h2 className="text-[16px] font-bold">Change Password</h2>
                {/* Step Indicator */}
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className={currentStep >= 1 ? "text-[#FAB435] font-bold" : ""}>1. Init</span>
                    <span>&gt;</span>
                    <span className={currentStep >= 2 ? "text-[#FAB435] font-bold" : ""}>2. Verify</span>
                    <span>&gt;</span>
                    <span className={currentStep === 3 ? "text-[#FAB435] font-bold" : ""}>3. Update</span>
                </div>
            </div>
            <hr className="mb-6" />

            <div className="px-3 lg:px-6 pt-3">
                {/* --- VIEW 1: SEND OTP --- */}
                {currentStep === Steps.SEND_OTP && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
                        <div className="h-16 w-16 bg-[#FAB435]/20 rounded-full flex items-center justify-center">
                            <Lock className="h-8 w-8 text-[#FAB435]" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h3 className="text-lg font-semibold">Security Verification</h3>
                            <p className="text-sm text-gray-500">
                                To protect your account, we need to verify your identity.
                                We will send a One-Time Password (OTP) to your registered email
                                {user?.email ? <span className="font-medium text-foreground"> ({user.email})</span> : ""}.
                            </p>
                        </div>
                        <Button
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="bg-[#FAB435] text-[#3A3A3A] font-semibold hover:text-white px-8"
                        >
                            {isLoading ? <ClipLoader size={16} color="#3A3A3A" /> : "Send OTP Code"}
                        </Button>
                    </div>
                )}

                {/* --- VIEW 2: VERIFY OTP --- */}
                {currentStep === Steps.VERIFY_OTP && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-10">
                        <div className="h-16 w-16 bg-[#FAB435]/20 rounded-full flex items-center justify-center">
                            <Mail className="h-8 w-8 text-[#FAB435]" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">Enter OTP</h3>
                            <p className="text-sm text-gray-500">
                                Please enter the code sent to your email.
                            </p>
                        </div>

                        <div className="w-full max-w-xs">
                            <Input
                                type="text"
                                placeholder="Enter Code (e.g. 1234)"
                                className="text-center text-lg tracking-widest py-6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>

                        <div className="flex gap-4 w-full max-w-xs">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(Steps.SEND_OTP)}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleVerifyOtp}
                                disabled={isLoading || !otp}
                                className="flex-1 bg-[#FAB435] text-[#3A3A3A] font-semibold hover:text-white"
                            >
                                {isLoading ? <ClipLoader size={16} /> : "Verify"}
                            </Button>
                        </div>

                        <p className="text-xs text-gray-400 cursor-pointer hover:underline" onClick={handleSendOtp}>
                            Didn't receive code? Resend
                        </p>
                    </div>
                )}

                {/* --- VIEW 3: CHANGE PASSWORD (Original Form) --- */}
                {currentStep === Steps.CHANGE_PASSWORD && (
                    <div className="animate-in fade-in slide-in-from-right duration-300">
                        <div className="mb-6 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Identity verified. You may now update your password.</span>
                        </div>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    className="py-5"
                                                    placeholder="Enter current password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    className="py-5"
                                                    placeholder="Enter new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    className="py-5"
                                                    placeholder="Confirm new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-[40%] bg-[#FAB435] text-[#3A3A3A] dark:text-[#3A3A3A] font-semibold hover:text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            Updating...
                                            <ClipLoader size={16} color="#3A3A3A" className="ml-2" />
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;