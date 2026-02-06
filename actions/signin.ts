/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

type LoginResponse = {
  status: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string;
      type: string;
      avatar: string;
      signature: string | null;
      plan_expire_date: string | null;
      requested_plan: string;
      otp: string | null;
      verify_token: string | null;
      is_login_enable: string;
      last_login: string | null;
      is_active: string;
      referral_code: string;
      created_by: string;
      created_at: string;
      updated_at: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      employee: any | null;
    };
    token: string;
    token_type: string;
  };
};

type LoginResult = {
  success: boolean;
  message: string;
  user?: LoginResponse["data"]["user"];
  token?: string;
};

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/client/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          device_name: "web-browser", 
        }),
      }
    );

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }
      if (response.status === 422) {
        return {
          success: false,
          message: "Please check your email and password",
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          message: "Your account has been disabled. Please contact support.",
        };
      }
      return {
        success: false,
        message: data.message || "Login failed. Please try again.",
      };
    }

    if (!data.status) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    if (data.data.user.is_active !== "1") {
      return {
        success: false,
        message: "Your account is inactive. Please contact support.",
      };
    }

    if (data.data.user.is_login_enable !== "1") {
      return {
        success: false,
        message: "Login is disabled for your account. Please contact support.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    });

    return {
      success: true,
      message: data.message,
      user: data.data.user,
      token: data.data.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}



interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ChangePasswordResponse {
  statusCode: number;
  error: string | null;
  message?: string;
  data?: any;
}

export async function changePassword(
  payload: ChangePasswordPayload,
  token: string
): Promise<ChangePasswordResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/client/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        error: data.message || "Failed to change password",
        data: null,
      };
    }

    return {
      statusCode: response.status,
      error: null,
      message: data.message || "Password changed successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      statusCode: 500,
      error: "Network error. Please try again.",
      data: null,
    };
  }
}
