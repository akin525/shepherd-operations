import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";

const Dashboardlayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <Sidebar />
            <main className="md:ml-64 transition-all duration-300">
                <div className="container mx-auto px-4 py-6 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Dashboardlayout;