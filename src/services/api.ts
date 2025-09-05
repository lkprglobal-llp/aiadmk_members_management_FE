// API service layer for connecting to your MySQL backend
// Replace BASE_URL with your actual backend URL

import { set } from "date-fns";
import { appendOffsetOfLegend } from "recharts/types/util/ChartUtils";

const BASE_URL = "http://localhost:5253/api"; // Update this with your backend URL

export interface Member {
  id?: number;
  mobile: string;
  name: string;
  parents_name: string;
  address: string;
  education_qualification: string;
  caste: string;
  joining_details: string;
  party_member_number: string;
  voter_id: string;
  aadhar_number: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  position: string;
  jname: string;
  tname: string;
  dname: string;
}

export interface Admins {
  id?: number;
  username: string;
  mobile: string;
  role: "admin" | "user";
  created_at?: string;
  otp: string;
  otp_expiry: string;
  is_verified: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  user?: T;
  token?: string;
  message?: string;
  data?: T[];
}

interface Position {
  tcode: string;
  dcode: string;
  jcode: string;
  tname: string;
  dname: string;
  jname: string;
}

// export interface union {
//   dcode: string;
//   dname: string;
// }
// export interface team {
//   tcode: string;
//   tname: string;
//   union: union[];
// }
// export interface position {
//   jcode: string;
//   jname: string;
//   team: team[];
// }
class ApiService {
  private async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Unauthorized");
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }

  // Authentication APIs
  async registerUser(
    username: string,
    mobile: string,
    role: string
  ): Promise<ApiResponse<Admins>> {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, mobile, role }),
      });

      if (!response.ok) throw new Error("Registration failed");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(mobile: string): Promise<ApiResponse<never>> {
    try {
      const response = await fetch(`${BASE_URL}/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      if (!data) {
        throw new Error("User not found");
      }
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  // async validateOtp(
  //   mobile: string,
  //   otp: string
  // ): Promise<{
  //   success: boolean;
  //   token: string;
  //   user: Admins;
  //   message: string;
  // }> {
  //   try {
  //     const response = await fetch(`${BASE_URL}/validate-OTP`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ mobile, otp }),
  //     });
  //     if (!response) throw new Error("OTP validation failed");
  //     const data = await response.json();
  //     // console.log(data.user);
  //     return {
  //       success: true,
  //       token: data.token,
  //       user: data.user,
  //       message: data.message || "Login successful",
  //     };
  //   } catch (error) {
  //     console.error("OTP validation error:", error);
  //     throw error;
  //   }
  // }
  async validateOtp(
    mobile: string,
    otp: string
  ): Promise<{
    success: boolean;
    token?: string;
    user?: Admins;
    message: string;
  }> {
    try {
      const response = await fetch(`${BASE_URL}/validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "OTP validation failed");
      }

      const data = await response.json();
      console.log("validateOtp raw response:", data);

      if (!data.success) {
        throw new Error(data.error || data.message || "Invalid OTP or user");
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message || "Login successful",
      };
    } catch (error) {
      console.error("OTP validation error:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred during OTP validation");
    }
  }

  //** Validate token with the promise state */
  async validateToken(token: string): Promise<Admins> {
    try {
      const response = await this.fetchWithAuth(`${BASE_URL}/validate-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Invalid token" : "Token validation failed"
        );
      }
      const data = await response.json();
      if (!data.user) {
        throw new Error("Token validation response missing user");
      }
      // Token is valid, no need to return anything
      return data.user;
    } catch (error) {
      console.error("Token validation error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) throw new Error("Logout failed");
    await response.json();
  }

  //Members API

  async getMembers(): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`${BASE_URL}/view-members`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      // console.log(response);
      const data = await response.json();
      // console.log(data);
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to fetch members"
        );
      }

      // return Array.isArray(data.members) ? data.members : [];

      return data.members;
    } catch (error) {
      console.error("Get members error:", error);
      // Mock data for demo
      // return mockMembers;
    }
  }

  async registerMember(member: Omit<Member, "id">): Promise<Member> {
    try {
      const response = await fetch(`${BASE_URL}/Register-Member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(member),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to add member"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Register member error:", error);
      throw error;
    }
  }

  async updateMember(id: number, member: Partial<Member>): Promise<Member> {
    try {
      const response = await fetch(`${BASE_URL}/Update-Member/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(member),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to update member"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Update member error:", error);
      // Mock response
      return { ...member, id } as Member;
    }
  }

  async deleteMember(id: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/Delete-Member/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to delete member"
        );
      }
    } catch (error) {
      console.error("Delete member error:", error);
    }
  }

  async exportMember(id: number): Promise<Blob> {
    try {
      const response = await this.fetchWithAuth(`/api/members/${id}/export`, {
        headers: { "Content-Type": "application/octet-stream" },
      });
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to export member"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Export member error:", error);
      throw error;
    }
  }

  async exportAllMembers(): Promise<Blob> {
    try {
      const response = await this.fetchWithAuth("/api/members/export", {
        headers: { "Content-Type": "application/octet-stream" },
      });
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to export members"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Export all members error:", error);
      throw error;
    }
  }

  async getPositions(): Promise<Position[][]> {
    try {
      const response = await this.fetchWithAuth(`${BASE_URL}/view-positions`);

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to fetch positions"
        );
      }
      const data = await response.json();
      return data.positions;
    } catch (error) {
      console.error("Get positions error:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
