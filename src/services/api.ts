// API service layer for connecting to your MySQL backend
// Replace BASE_URL with your actual backend URL

import { set } from "date-fns";
import { appendOffsetOfLegend } from "recharts/types/util/ChartUtils";
import { json } from "stream/consumers";

const BASE_URL = "http://localhost:5253/api"; // Update this with your backend URL

export interface Member {
  id?: number;
  mobile: string;
  name: string;
  date_of_birth: string;
  parents_name: string;
  address: string;
  education_qualification: string;
  caste: string;
  joining_date: string;
  joining_details: string;
  party_member_number: string;
  voter_id: string;
  aadhar_number: string;
  image?: string | File; // 👈 allow both;
  created_at?: string;
  updated_at?: string;
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

export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  images?: string[] | File[]; // 👈 allow both
  location: string;
  created_at?: string;
  updated_at?: string;
}

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
      // console.log("validateOtp raw response:", data);

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

  // async logout(): Promise<void> {
  //   const response = await fetch(`${BASE_URL}/logout`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //     },
  //   });

  //   if (!response.ok) throw new Error("Logout failed");
  //   await response.json();
  // }

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
      // console.log(data.members);
      return data.members;
    } catch (error) {
      console.error("Get members error:", error);
      // Mock data for demo
      // return mockMembers;
    }
  }

  async registerMember(member: FormData): Promise<Member> {
    try {
      const response = await fetch(`${BASE_URL}/Register-Member`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: member,
      });
      console.log("api", member);

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

  async updateMember(id: number | string, payload: FormData): Promise<Member> {
    try {
      // const isFormData = payload instanceof FormData;
      const response = await fetch(`${BASE_URL}/update-member/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: payload,
      });

      if (!response) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to update member"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Update member error:", error);
      // Mock response
      return { id } as Member;
    }
  }

  async deleteMember(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/delete-member/${id}`, {
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

      return await response.json();
    } catch (error) {
      console.error("Delete member error:", error);
    }
  }

  async exportMember(id: number): Promise<Blob> {
    try {
      const response = await this.fetchWithAuth(
        `${BASE_URL}/export/member/${id}`,
        {
          headers: { "Content-Type": "application/octet-stream" },
        }
      );
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
      const response = await this.fetchWithAuth(`${BASE_URL}/export/members`, {
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

  async getEvents() {
    try {
      const response = await this.fetchWithAuth(`${BASE_URL}/view-events`);

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to fetch events"
        );
      }
      const data = await response.json();
      // console.log(data.events);
      return data.events;
    } catch (error) {
      console.error("Get events error:", error);
      throw error;
    }
  }

  async addEvent(formdata: FormData): Promise<Event> {
    try {
      const response = await this.fetchWithAuth(`${BASE_URL}/add-event`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        method: "POST",
        body: formdata,
      });
      console.log("api", formdata);

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to add event"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Add event error:", error);
      throw error;
    }
  }

  async updateEvent(id: number | string, event: FormData): Promise<Event> {
    try {
      const response = await this.fetchWithAuth(
        `${BASE_URL}/update-event/${id}`,
        {
          method: "PUT",
          body: event,
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to update event"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Update event error:", error);
      throw error;
    }
  }

  async deleteEvent(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchWithAuth(
        `${BASE_URL}/delete-event/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to delete event"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Delete event error:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
