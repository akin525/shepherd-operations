"use server";

import { cookies } from "next/headers";

export type PaymentItem = {
  id: number;
  Reference: string;
  service: string;
  numberOfStaffs: number;
  status: "Pending" | "paid";
  date: string;
  amount?: string;
  type?: string;
};

export type PaymentHeader = {
  title: string;
  total_amount: string;
  completion_percent: number;
  active_tab: string;
};

export type PaymentFilters = {
  q: string | null;
  type: string | null;
  status: string | null;
  from: string | null;
  to: string | null;
};

export type PaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type PaymentRows = {
  current_page: number;
  data: PaymentItem[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type PaymentData = {
  header: PaymentHeader;
  filters: PaymentFilters;
  rows: PaymentRows;
};

type PaymentResponse = {
  status: boolean;
  data: PaymentData;
  message: string;
};

export type PaymentResult = {
  success: boolean;
  message: string;
  data?: PaymentData;
};

export async function getPayments(
  page: number = 1,
  q?: string,
  type?: string,
  status?: string,
  from?: string,
  to?: string
): Promise<PaymentResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const params = new URLSearchParams({
      page: page.toString(),
    });

    if (q) params.append("q", q);
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/client/payment?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: "Session expired. Please login again.",
        };
      }
      return {
        success: false,
        message: "Failed to fetch payment history",
      };
    }

    const result: PaymentResponse = await response.json();

    if (!result.status) {
      return {
        success: false,
        message: result.message || "Failed to retrieve data",
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }
}
