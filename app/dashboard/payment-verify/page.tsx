"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// 1. The inner component containing the logic
const VerifyContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const reference = searchParams.get("reference");

    const hasVerified = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (!token || !reference || hasVerified.current) return;

            hasVerified.current = true;

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/client/verify-transaction/${reference}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json"
                        }
                    }
                );

                const data = await res.json();

                if (data.status) {
                    toast.success("Payment Successful!");
                } else {
                    toast.error(data.message || "Payment Verification Failed.");
                }
            } catch (error) {
                console.error("Verification Error:", error);
                toast.error("Network error during verification.");
            } finally {
                router.push("/dashboard/overview");
            }
        };

        verify();
    }, [token, reference, router]);

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-gray-500">Please do not close this page.</p>
        </div>
    );
};

// 2. The main page component wrapping the logic in Suspense
const PaymentVerifyPage = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
};

export default PaymentVerifyPage;