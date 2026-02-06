"use client";

import { useState } from "react";
import {
    Menu,
    Sun,
    Moon,
    LogOut,
    Hexagon,
    FileText,
    Users,
    MessageSquareWarning,
    ClipboardList,
    BarChart3,
    LayoutGrid,
    ChevronRight
} from "lucide-react";
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
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [isdialogOpen, setIsDialogOpen] = useState(false);
    const pathname = usePathname();
    const { setTheme } = useTheme();
    const { logout } = useAuth();

    // Navigation Items
    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard/overview",
            icon: Hexagon,
            hasSubmenu: true
        },
        {
            name: "Site Assessments",
            path: "/dashboard/site-assessments",
            icon: FileText,
            hasSubmenu: false
        },
        {
            name: "Attendance",
            path: "/dashboard/attendance",
            icon: Users,
            hasSubmenu: false
        },
        {
            name: "Incidents",
            path: "/dashboard/incidents",
            icon: MessageSquareWarning,
            hasSubmenu: true
        },
        {
            name: "Patrol Updates",
            path: "/dashboard/patrol-updates",
            icon: ClipboardList,
            hasSubmenu: true
        },
        {
            name: "Manning Structure",
            path: "/dashboard/manning-structure",
            icon: BarChart3,
            hasSubmenu: true
        },
        {
            name: "SOP Generator",
            path: "/dashboard/sop-generator",
            icon: LayoutGrid,
            hasSubmenu: false
        },
    ];

    // Reusable Nav Link Component
    const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
            <Link
                href={item.path}
                onClick={onClick}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group ${
                    isActive
                        ? "bg-[#FAB435]/10 text-[#FAB435]"
                        : "text-[#545454] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
            >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#FAB435] fill-current" : "group-hover:text-gray-900 dark:group-hover:text-white"}`} />
                <span className="flex-1">{item.name}</span>
                {item.hasSubmenu && (
                    <ChevronRight className={`h-4 w-4 text-gray-400 ${isActive ? "text-[#FAB435]" : ""}`} />
                )}
            </Link>
        );
    };

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full bg-white dark:bg-background">
            {/* Logo Area */}
            <div className="p-8 flex items-center justify-center">
                <Link href="/dashboard/overview" onClick={() => isMobile && setOpen(false)}>
                    <Image
                        src={"/shepherdhill.svg"}
                        width={120}
                        height={120}
                        alt="Shepherd Hill Security"
                        className="w-[120px] h-auto object-contain"
                    />
                </Link>
            </div>

            {/* Navigation Links */}
            <ScrollArea className="flex-1 px-4">
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            item={item}
                            onClick={() => isMobile && setOpen(false)}
                        />
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer Area */}
            <div className="p-4 border-t border-border/40 space-y-4">

                <div className="flex items-center justify-between gap-2">

                    {/* --- Theme Toggle Dropdown --- */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
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
                    {/* ----------------------------- */}

                    {/* Logout */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="flex-1 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 justify-start px-2">
                                <LogOut className="w-4 h-4" />
                                <span className="text-xs font-medium">Log Out</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be returned to the login screen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => logout()} className="bg-red-500 hover:bg-red-600">
                                    Sign Out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard/overview">
                    <Image
                        src={"/shepherdhill.svg"}
                        width={40}
                        height={40}
                        alt="logo"
                        className="w-[40px]"
                    />
                </Link>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px]">
                        <SidebarContent isMobile={true} />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-background z-40">
                <SidebarContent />
            </aside>

            <AddNewService open={isdialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
};

export default Sidebar;