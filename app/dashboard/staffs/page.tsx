"use client";

import { useState, useEffect } from "react";
import Headercontent from "@/components/Headercontent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Star, Eye, Loader2 } from "lucide-react"; // Added Loader2
import { toast } from "sonner";
import { TfiReload } from "react-icons/tfi";
import { useAuth } from "@/context/AuthContext";

import { getClientStaff } from "@/actions/staff";

interface Staff {
  id: string;
  name: string;
  email: string;
  timeResume: string;
  status: string;
  avatar?: string;
  role: string;
  rating?: number;
  existingReview?: string;
}

const StaffList = () => {
  const { token, user } = useAuth();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New State

  const fetchStaff = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const rawStaff = await getClientStaff(token);
      // Ensure your backend returns rating/review data here to populate the list correctly
      const mapped: Staff[] = rawStaff.map((item: any) => ({
        id: item.id.toString(),
        name: item.name.trim() || "Unknown Staff",
        email: item.email || "—",
        timeResume: item.resume_time || "—",
        status: item.status || "Unknown",
        role: item.role || "Staff",
        rating: item.rating ?? 0,
        existingReview: item.rating_comment ?? "", // Ensure backend sends this field
      }));

      setStaffList(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load staff members");
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleRefresh = () => {
    fetchStaff();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const handleReviewClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(false);
    setReviewRating(staff.rating || 0);
    setReviewText(staff.existingReview || "");
    setIsReviewModalOpen(true);
  };

  const handleViewReview = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(true);
    setReviewRating(staff.rating || 0);
    setReviewText(staff.existingReview || "");
    setIsReviewModalOpen(true);
  };

  // --- CONNECTED SUBMIT FUNCTION ---
  const handleSubmitReview = async () => {
    if (!selectedStaff) return;

    if (reviewRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please enter a review message");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/add-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          staff_id: selectedStaff.id, // Sending the ID to identify who we are rating
          star: reviewRating,
          review: reviewText,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status) {
        toast.success(result.message || "Review submitted successfully");
        setIsReviewModalOpen(false);
        setReviewRating(0);
        setReviewText("");
        setSelectedStaff(null);
        fetchStaff(); // Refresh list to show new rating immediately
      } else {
        toast.error(result.message || "Failed to submit review");
        if(result.errors) {
          console.error(result.errors);
        }
      }
    } catch (error) {
      console.error("Review Error:", error);
      toast.error("An error occurred while submitting the review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="mt-10">
        <Headercontent
            title="Operatives Management"
            subTitle={user?.name || "User"}
            description="View and manage all operatives members assigned to this location"
        />

        <div className="w-full mt-3 space-y-6">
          <Card className="border-none bg-primary-foreground shadow-lg">
            <CardHeader className="flex items-center justify-between px-6">
              <div>
                <h1 className="text-[14px] font-bold text-[#3A3A3A] dark:text-white">
                  Current Operatives ({staffList.length})
                </h1>
                <p className="text-[12px] text-[#979797] mt-1">
                  Active personnel on duty at {user?.name || "this location"}
                </p>
              </div>

              <Button
                  onClick={handleRefresh}
                  disabled={loading || !token}
                  className="bg-[#FAB435]/30 text-[#E89500] hover:bg-[#FAB435]/50"
              >
                <TfiReload
                    className={`text-4xl ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </CardHeader>

            <CardContent className="p-2 lg:px-6">
              {loading ? (
                  <div className="py-16 text-center text-muted-foreground">
                    Loading operatives members...
                  </div>
              ) : error ? (
                  <div className="py-16 text-center space-y-6">
                    <p className="text-lg text-destructive font-medium">{error}</p>
                    <Button onClick={handleRefresh} className="bg-[#FAB435] hover:bg-[#E89500] text-white">
                      Try Again
                    </Button>
                  </div>
              ) : staffList.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    No operatives members found.
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Operatives Member</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Resume Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffList.map((staff) => (
                            <TableRow key={staff.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={staff.avatar} />
                                    <AvatarFallback className="bg-[#FAB435]/20 text-[#E89500] font-semibold">
                                      {getInitials(staff.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-[14px] text-[#3A3A3A] dark:text-white">
                              {staff.name}
                            </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-[14px] text-[#979797]">{staff.email}</TableCell>
                              <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                                {staff.role}
                              </TableCell>
                              <TableCell className="font-medium text-[14px] text-[#3A3A3A] dark:text-[#979797]">
                                {staff.timeResume}
                              </TableCell>
                              <TableCell>
                                <Badge
                                    className={
                                      staff.status === "Active"
                                          ? "text-[#5ECF53] bg-transparent"
                                          : staff.status === "On Leave"
                                              ? "text-[#E89500] bg-transparent"
                                              : "text-[#979797] bg-transparent"
                                    }
                                >
                            <span
                                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    staff.status === "Active"
                                        ? "bg-[#5ECF53]"
                                        : staff.status === "On Leave"
                                            ? "bg-[#E89500]"
                                            : "bg-[#979797]"
                                }`}
                            />
                                  {staff.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {staff.rating ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-[#FAB435] text-[#FAB435]" />
                                      <span className="text-[14px] font-medium">{staff.rating}</span>
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-[#979797]">No rating</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleViewReview(staff)} className="cursor-pointer">
                                      <Eye className="mr-2 h-4 w-4" />
                                      {staff.existingReview ? "View Review" : "No Review Yet"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReviewClick(staff)} className="cursor-pointer">
                                      <Star className="mr-2 h-4 w-4" />
                                      {staff.rating ? "Update Review" : "Add Review"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-[#3A3A3A] dark:text-white">
                {isViewMode
                    ? "Operative Review"
                    : selectedStaff?.rating
                        ? "Update Review"
                        : "Add Review"}
              </DialogTitle>
            </DialogHeader>

            {selectedStaff && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedStaff.avatar} />
                      <AvatarFallback className="bg-[#FAB435]/20 text-[#E89500] font-semibold">
                        {getInitials(selectedStaff.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[16px] text-[#3A3A3A] dark:text-white">
                        {selectedStaff.name}
                      </h3>
                      <p className="text-[12px] text-[#979797]">{selectedStaff.role}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[14px] font-medium text-[#3A3A3A] dark:text-white mb-2 block">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button
                              key={star}
                              type="button"
                              disabled={isViewMode}
                              onClick={() => !isViewMode && setReviewRating(star)}
                              className={`transition-all ${
                                  isViewMode ? "cursor-default" : "cursor-pointer hover:scale-110"
                              }`}
                          >
                            <Star
                                className={`w-8 h-8 ${
                                    star <= reviewRating
                                        ? "fill-[#FAB435] text-[#FAB435]"
                                        : "text-[#E0E0E0]"
                                }`}
                            />
                          </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[14px] font-medium text-[#3A3A3A] dark:text-white mb-2 block">
                      Review
                    </label>
                    <Textarea
                        placeholder="Share your feedback about this staff member..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        disabled={isViewMode}
                        className="min-h-[120px] bg-[#F3F4F6]"
                    />
                  </div>
                </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                {isViewMode ? "Close" : "Cancel"}
              </Button>
              {!isViewMode && (
                  <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="bg-[#FAB435] hover:bg-[#E89500] text-white"
                  >
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                    ) : (
                        "Submit Review"
                    )}
                  </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default StaffList;