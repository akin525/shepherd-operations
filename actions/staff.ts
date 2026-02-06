"use server";

interface ApiStaff {
  id: number;
  staff_member: {
    full_name: string;
    initials: string;
  };
  name: string;
  email: string;
  role: string;
  resume_time: string;
  status: string;
  rating: number | null;
  rating_formatted: string;
}

interface StaffResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: ApiStaff[];
  };
}

export async function getClientStaff(token: string): Promise<ApiStaff[]> {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/client/staff`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch staff: ${res.status} ${res.statusText}`);
    }

    const json: StaffResponse = await res.json();

    if (!json.status || !json.data?.data) {
      throw new Error(json.message || "Invalid response format from staff endpoint");
    }

    return json.data.data;
  } catch (error) {
    console.error("[getClientStaff error]", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to load client staff members");
  }
}