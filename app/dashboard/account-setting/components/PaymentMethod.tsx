import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const PaymentMethod = () => {
  return (
    <div className="bg-primary-foreground py-6 rounded-lg shadow">
      <h2 className="text-[16px]  font-bold mb-4 px-3 lg:px-6">
        Payment Method
      </h2>
      <hr />
      <div className="px-3 lg:px-6 pt-2 space-y-3">
        <div className="w-full">
          <Image
            src={"/vis.svg"}
            alt="visa"
            width={600}
            height={600}
            className="h-[62px] w-[483px]"
          />
        </div>

        <Button className="bg-[#FAB435]/30 text-[#E59300]">
          Update Payment Method
        </Button>
        <p className="text-[#979797] dark:text-white font-regular text-[14px]">
          Enable two-factor authentification to add an extra layer of security
          to your account. When you log in, we’ll send a 6-digit code to your
          email that you’ll have to enter to verify it’s you.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethod;
