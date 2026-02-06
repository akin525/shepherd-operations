"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface AccountData {
  name: string;
  email: string;
  // Note: Address isn't in your current API response, 
  // but I've kept the field for your UI.
}

const AccountInformation = () => {
  const { token } = useAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/client/account-info`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        if (result.status) {
          setAccountData(result.data);
        }
      } catch (error) {
        console.error("Account Info Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAccountInfo();
  }, [token]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
    );
  }

  return (
      <div className="bg-primary-foreground shadow-lg rounded-lg py-6">
        <h2 className="text-[16px] font-bold mb-4 px-3 lg:px-6">Account Information</h2>
        <hr />
        <div className="space-y-4 px-3 lg:px-6 pt-3">
          <div>
            <Label className="text-[14px] font-medium mb-2">Full Name</Label>
            <Input
                type="text"
                readOnly
                value={accountData?.name || ""}
                placeholder="Loading name..."
                className="w-full px-4 py-2 bg-muted/20"
            />
          </div>
          <div>
            <Label className="text-[14px] font-medium mb-2">Email</Label>
            <Input
                type="email"
                readOnly
                value={accountData?.email || ""}
                placeholder="Loading email..."
                className="w-full px-4 py-2 bg-muted/20"
            />
          </div>
          <div>
            <Label className="text-[14px] font-medium mb-2">Address</Label>
            <Input
                type="text"
                placeholder="No address provided"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[#979797] font-regular text-[14px] mt-1">
              This address will be used as your billing address
            </p>
          </div>
        </div>
      </div>
  );
};

export default AccountInformation;