/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { usePayment } from "@/hooks/usePayment";

const PaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = usePayment();

  return (
      <div className="w-full mt-7 space-y-6">
        <Card className="border-none bg-primary-foreground shadow-lg">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-6">
            <div>
              <CardTitle className="text-[18px] font-bold text-[#3A3A3A] dark:text-white">
                Payment History
              </CardTitle>
              <CardDescription>
                View all your recent transactions and their status.
              </CardDescription>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-[300px] mt-4 md:mt-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search payment ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 lg:p-6">
            {isLoading ? (
                <div className="text-center py-10">
                  <p className="text-[#979797]">Loading payment history...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Failed to load payments
                </div>
            ) : !data?.rows?.data || data.rows.data.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#979797]">No payment records found.</p>
                </div>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-[#3A3A3A]/50 text-[12px] font-medium">
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Payment ID
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Service Type
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Staff Count
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Amount
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Status
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Date
                      </TableHead>
                      <TableHead className="text-[#3A3A3A]/50 text-[12px] font-medium dark:text-white">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                    {data.rows.data.map((item: any, index: number) => (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                            {item.payment_id || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                            {item.service || item.type || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                            {item.staff_count || item.staff || 0}
                          </TableCell>
                          <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                            ₦{(item.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                                variant="outline"
                                className={`${
                                    item.status === "successful" || item.status === "paid"
                                        ? "text-[#5ECF53] border-[#5ECF53]"
                                        : item.status === "pending"
                                            ? "text-[#E89500] border-[#E89500]"
                                            : "text-red-500 border-red-500"
                                } bg-transparent`}
                            >
                              {item.status || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                            {item.created_at || item.date || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              ...
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default PaymentHistory;