"use client";
import { useState } from "react";
import { Octagon, Podcast, Menu, Sun, Moon } from "lucide-react";
import { MdOutlinePayments } from "react-icons/md";
import {IoIosBook, IoIosSettings} from "react-icons/io";
import { LiaMoneyCheckSolid } from "react-icons/lia";
import { LuLayoutDashboard } from "react-icons/lu";
import AddNewService from "./AddNewService";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isdialogOpen, setIsDialogOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", path: "/dashboard/overview", icon: LuLayoutDashboard },
    {
      name: "Subscription",
      path: "/dashboard/subscription",
      icon: LiaMoneyCheckSolid,
    },
    {
      name: "Payment History",
      path: "/dashboard/payment-history",
      icon: MdOutlinePayments,
    },
    {
      name: "Operatives",
      path: "/dashboard/staffs",
      icon: MdOutlinePayments,
    },
    {
      name: "Account Setting",
      path: "/dashboard/account-setting",
      icon: IoIosSettings,
    },
    {
      name: "Escalations",
      path: "/dashboard/Escalations",
      icon: IoIosBook,
    },
  ];

  const handleNavClick = () => {
    setOpen(false);
  };
  const { setTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full  border-b bg-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard/overview">
              <Image
                src={"/shepherdhill.svg"}
                width={100}
                height={100}
                alt="logo"
                className="w-[50px] md:w-[80px]"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#FAB435] font-bold text-[14px]"
                      : "text-[#545454] dark:text-white font-regular text-[14px]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-[#FAB435] "></span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#FAB435]/30 text-[#E59300]"
            >
              + Request New Service
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <SheetTrigger asChild>
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
              </div>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] px-4"
              >
                <SheetTitle className="hidden">Edit profile</SheetTitle>

                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3  py-3 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? "text-[#FAB435] font-bold text-[14px]"
                            : "text-[#545454] dark:text-white font-regular text-[14px]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-[#FAB435]/30 text-[#E59300]"
                  >
                    + Request New Service
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button className="bg-[#F42121]/10  text-[#F42121] dark:bg-[#F42121]/20  dark:text-white w-full  mt-4">
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <AddNewService open={isdialogOpen} onOpenChange={setIsDialogOpen} />
    </header>
  );
};

export default Header;
