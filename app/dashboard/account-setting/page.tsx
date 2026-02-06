/* eslint-disable react-hooks/static-components */
"use client";
import React, { useState } from "react";
import AccountInformation from "./components/AccountInformation";
import ChangePassword from "./components/ChangePassword";
import Security from "./components/Security";
import PaymentMethod from "./components/PaymentMethod";
import EnquiryEscalation from "./components/EnquiryEscalation";
import Headercontent from "@/components/Headercontent";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";

const AccountSetting = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const {logout} = useAuth()
  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountInformation />;
      case "password":
        return <ChangePassword />;
      case "security":
        return <Security />;
      case "payment":
        return <PaymentMethod />;
      case "enquiry":
        return <EnquiryEscalation />;
      default:
        return <AccountInformation />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const NavContent = () => (
    <>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => handleTabChange("account")}
            className={`w-full text-left py-3 rounded-lg transition-colors ${
              activeTab === "account"
                ? "text-[#FAB435] text-[14px] font-bold"
                : "font-regular text-[#545454] dark:text-white"
            }`}
          >
            Account Information
          </button>
        </li>
        <li>
          <button
            onClick={() => handleTabChange("password")}
            className={`w-full text-left py-3 rounded-lg transition-colors ${
              activeTab === "password"
                ? "text-[#FAB435] text-[14px] font-bold"
                : "font-regular text-[#545454] dark:text-white"
            }`}
          >
            Change Password
          </button>
        </li>
        {/*<li>*/}
        {/*  <button*/}
        {/*    onClick={() => handleTabChange("security")}*/}
        {/*    className={`w-full text-left py-3 rounded-lg transition-colors ${*/}
        {/*      activeTab === "security"*/}
        {/*        ? "text-[#FAB435] text-[14px] font-bold"*/}
        {/*        : "font-regular text-[#545454] dark:text-white"*/}
        {/*    }`}*/}
        {/*  >*/}
        {/*    Security*/}
        {/*  </button>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <button*/}
        {/*    onClick={() => handleTabChange("payment")}*/}
        {/*    className={`w-full text-left py-3 rounded-lg transition-colors ${*/}
        {/*      activeTab === "payment"*/}
        {/*        ? "text-[#FAB435] text-[14px] font-bold"*/}
        {/*        : "font-regular text-[#545454] dark:text-white"*/}
        {/*    }`}*/}
        {/*  >*/}
        {/*    Payment Method*/}
        {/*  </button>*/}
        {/*</li>*/}
        <li>
          <button
            onClick={() => handleTabChange("enquiry")}
            className={`w-full text-left py-3 rounded-lg transition-colors ${
              activeTab === "enquiry"
                ? "text-[#FAB435] text-[14px] font-bold"
                : "font-regular text-[#545454] dark:text-white"
            }`}
          >
            Escalation
          </button>
        </li>
      </ul>

      <AlertDialog>
        <AlertDialogTrigger>
          <Button className="bg-[#F42121]/10 hidden lg:inline text-[#F42121] dark:bg-[#F42121]/20  dark:text-white w-full  mt-4">
            Sign Out
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border border-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will log you out of the system
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center flex-row justify-center">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => logout()}
              className="dark:text-white bg-red-500 dark:hover:text-[#3A3A3A]"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return (
    <div className="mt-10">
      <Headercontent subTitle="Account Setting" />

      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between"
        >
          <span>Menu</span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="hidden lg:block w-64 flex-shrink-0 pt-6">
          <NavContent />
        </nav>

        {isMobileMenuOpen && (
          <nav className="lg:hidden bg-primary-foreground p-4 rounded-lg shadow-lg mb-4">
            <NavContent />
          </nav>
        )}

        <div className="flex-1 w-full">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AccountSetting;
