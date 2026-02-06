// actions/subscription.ts
"use server";

import { cookies } from "next/headers";

export type SubscriptionItem = {
  number_of_staffs: number;
  id: number;
  period: string;
  service: string;
  number_of_staff: number;
  equipments: number;
  status: "Pending" | "paid";
  created_at?: string;
  updated_at?: string;
};

export type SubscriptionCards = {
  active_plans: number;
  validity_period: string;
  next_payment_date: string | null;
};

export type SubscriptionFilters = {
  service: string | null;
  status: string | null;
  period: string | null;
  available_services: string[];
};

export type PaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type SubscriptionItems = {
  current_page: number;
  data: SubscriptionItem[];
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

export type SubscriptionData = {
  cards: SubscriptionCards;
  filters: SubscriptionFilters;
  items: SubscriptionItems;
};

type SubscriptionResponse = {
  status: boolean;
  data: SubscriptionData;
  message: string;
};

export type SubscriptionResult = {
  success: boolean;
  message: string;
  data?: SubscriptionData;
};

export async function getSubscriptions(
  page: number = 1,
  service?: string,
  status?: string,
  period?: string
): Promise<SubscriptionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
    });

    if (service) params.append("service", service);
    if (status) params.append("status", status);
    if (period) params.append("period", period);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription?${params.toString()}`;

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
        message: "Failed to fetch subscriptions",
      };
    }

    const result: SubscriptionResponse = await response.json();

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
    console.error("Error fetching subscriptions:", error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }
}