"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Headercontent from "@/components/Headercontent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    ShieldCheck,
    Lock,
    Activity,
    Paperclip,
    LucideIcon,
    Search,
    Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NavOption {
    id: string;
    label: string;
    desc: string;
    icon: LucideIcon;
}

const SettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("profile");

    const options: NavOption[] = [
        { id: "profile", label: "Profile Details", desc: "View your profile details", icon: User },
        { id: "update", label: "Update Profile", desc: "Update your profile details", icon: ShieldCheck },
        { id: "password", label: "Password Settings", desc: "Update or Reset Password", icon: Lock },
        { id: "audit", label: "Audit Logs", desc: "Track system activity and changes", icon: Activity },
    ];

    return (
        <div className="space-y-6 mt-8 pb-10">
            <Headercontent
                title="Settings"
                description="Manage your Personal Information"
            />

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0 flex flex-col lg:flex-row min-h-[600px]">

                    {/* LEFT SIDE: Sub-navigation */}
                    <div className="w-full lg:w-80 border-r border-gray-100 p-8 space-y-10 bg-white z-10">
                        {options.map((option, index) => (
                            <div
                                key={option.id}
                                onClick={() => setActiveTab(option.id)}
                                className="relative flex items-start gap-4 cursor-pointer group"
                            >
                                {index !== options.length - 1 && (
                                    <div className={`absolute left-[9px] top-6 w-[2px] h-14 transition-colors duration-300 ${
                                        activeTab === option.id ? "bg-[#FAB435]" : "bg-gray-100"
                                    }`} />
                                )}

                                <div className={`z-20 w-[20px] h-[20px] rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                                    activeTab === option.id
                                        ? "bg-[#FAB435] border-[#FAB435]/20 scale-110 shadow-sm"
                                        : "bg-gray-300 border-white shadow-sm"
                                }`} />

                                <div className="flex-1">
                                    <p className={`text-sm font-bold leading-tight transition-colors duration-300 ${
                                        activeTab === option.id ? "text-[#FAB435]" : "text-gray-500 group-hover:text-gray-700"
                                    }`}>
                                        {option.label}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1 font-medium">{option.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT SIDE: Content Area */}
                    <div className="flex-1 p-10 bg-white">
                        {/* 1. PROFILE TAB */}
                        {activeTab === "profile" && (
                            <div className="space-y-12 transition-all duration-500 opacity-100 translate-y-0">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-[#FAB435]/10 flex items-center justify-center border-2 border-[#FAB435]/20 text-[#FAB435] text-xl font-bold">
                                        {user?.name?.charAt(0) || "J"}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{user?.name || "Jeremiah Okoja"}</h2>
                                        <p className="text-base text-gray-500 font-medium">
                                            {user?.role || "Admin"} • <span className="text-gray-400">{user?.email || "jeremiah@gmail.com"}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#FAB435] border-b-2 border-[#FAB435] w-fit pb-1">Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                                        <DetailItem label="Name" value={user?.name || "Jeremiah Okoja"} />
                                        <DetailItem label="Email" value={user?.email || "jeremiah@gmail.com"} />
                                        <DetailItem label="Phone" value="08011223868" />
                                        <DetailItem label="Role" value={user?.role || "Admin"} />
                                        <DetailItem label="Department" value="HR" />
                                        <DetailItem label="Last Login" value="Today, 9:40 AM" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-10">
                                    <Button onClick={() => setActiveTab("update")} className="bg-[#FAB435] hover:bg-[#d99820] text-white font-bold px-10 rounded-md h-12 shadow-md active:scale-95">
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. UPDATE TAB */}
                        {activeTab === "update" && (
                            <div className="space-y-8 transition-all duration-500 opacity-100 translate-y-0">
                                <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
                                <div className="max-w-2xl space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">Full Name</Label>
                                        <Input placeholder="Jeremiah Okoja" className="h-12 border-gray-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">Email Address</Label>
                                        <Input type="email" placeholder="jeremiah@gmail.com" className="h-12 border-gray-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">Profile Photo</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50/50 cursor-pointer group">
                                            <Paperclip className="text-gray-400 mb-2 group-hover:text-[#FAB435]" />
                                            <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700">Click to upload JPG image</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button variant="ghost" onClick={() => setActiveTab("profile")} className="font-bold text-gray-500">Cancel</Button>
                                        <Button className="bg-[#FAB435] hover:bg-[#d99820] text-white font-bold px-8 h-12 shadow-md">Save Changes</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. PASSWORD TAB */}
                        {activeTab === "password" && (
                            <div className="space-y-8 transition-all duration-500 opacity-100 translate-y-0">
                                <h2 className="text-2xl font-bold text-gray-900">Password Settings</h2>
                                <div className="max-w-xl space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">Current Password</Label>
                                        <Input type="password" placeholder="••••••••" className="h-12 border-gray-200" />
                                    </div>
                                    <hr className="border-gray-100 my-4" />
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">New Password</Label>
                                        <Input type="password" placeholder="Enter new password" className="h-12 border-gray-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700">Confirm New Password</Label>
                                        <Input type="password" placeholder="Repeat new password" className="h-12 border-gray-200" />
                                    </div>
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button variant="ghost" onClick={() => setActiveTab("profile")} className="font-bold text-gray-500">Cancel</Button>
                                        <Button className="bg-[#FAB435] hover:bg-[#d99820] text-white font-bold px-8 h-12 shadow-md">Update Password</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 4. AUDIT LOGS TAB */}
                        {activeTab === "audit" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Audit Header & Summary Cards */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                                        <p className="text-sm text-gray-500 font-medium">Monitoring system activity for <span className="text-[#FAB435]">{user?.email || "your account"}</span></p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Events</p>
                                            <p className="text-lg font-bold text-gray-700">1,284</p>
                                        </div>
                                        <div className="bg-green-50/50 px-4 py-2 rounded-lg border border-green-100">
                                            <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Security Score</p>
                                            <p className="text-lg font-bold text-green-700">98%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Bar */}
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <div className="relative w-full sm:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search action, IP, or status..."
                                            className="pl-10 h-11 bg-white border-gray-200 focus:ring-[#FAB435] rounded-lg"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button variant="outline" className="flex-1 sm:flex-none h-11 font-bold text-gray-600 border-gray-200 hover:bg-white">
                                            Last 30 Days
                                        </Button>
                                        <Button className="flex-1 sm:flex-none bg-[#FAB435] hover:bg-[#d99820] text-white font-bold h-11 px-6 shadow-sm">
                                            Export CSV
                                        </Button>
                                    </div>
                                </div>

                                {/* Audit Table */}
                                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-5">Action Event</th>
                                            <th className="px-6 py-5">Origin IP</th>
                                            <th className="px-6 py-5">Date & Time</th>
                                            <th className="px-6 py-5 text-right">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                        {[
                                            { action: "Password Changed", ip: "192.168.1.1", date: "Mar 02, 2026, 09:40 AM", status: "Success", desc: "User updated account credentials" },
                                            { action: "Profile Updated", ip: "102.89.34.12", date: "Feb 28, 2026, 02:22 PM", status: "Success", desc: "Changed display name and phone" },
                                            { action: "Login Attempt", ip: "45.12.89.201", date: "Feb 28, 2026, 08:10 AM", status: "Failed", desc: "Incorrect password entered" },
                                            { action: "Settings Accessed", ip: "102.89.34.12", date: "Feb 27, 2026, 11:05 AM", status: "Success", desc: "Viewed security preferences" },
                                            { action: "API Token Created", ip: "102.89.34.12", date: "Feb 25, 2026, 04:15 PM", status: "Success", desc: "Generated new production key" },
                                        ].map((log, i) => (
                                            <tr key={i} className="group hover:bg-[#FAB435]/5 transition-all duration-200 cursor-default">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 group-hover:text-[#FAB435] transition-colors">{log.action}</span>
                                                        <span className="text-[11px] text-gray-400 font-medium">{log.desc}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-xs text-gray-500 bg-gray-50/30 group-hover:bg-transparent">
                                                    {log.ip}
                                                </td>
                                                <td className="px-6 py-5 text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={13} className="text-gray-300" />
                                                        <span className="font-medium">{log.date}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    log.status === "Success"
                                        ? "bg-green-100/50 text-green-600 border border-green-200/50"
                                        : "bg-red-100/50 text-red-600 border border-red-200/50"
                                }`}>
                                    {log.status}
                                </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Showing 5 of 1,284 entries</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" disabled className="text-xs font-bold text-gray-400">Previous</Button>
                                        <Button variant="outline" className="h-9 w-9 p-0 font-bold border-[#FAB435] text-[#FAB435]">1</Button>
                                        <Button variant="ghost" className="h-9 w-9 p-0 font-bold text-gray-400 hover:text-gray-600">2</Button>
                                        <Button variant="ghost" className="h-9 w-9 p-0 font-bold text-gray-400 hover:text-gray-600">3</Button>
                                        <Button variant="ghost" className="text-xs font-bold text-gray-600">Next</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-black">{label}</p>
        <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
);

export default SettingsPage;