// API service layer for connecting to your MySQL backend
// Replace BASE_URL with your actual backend URL

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
  position: string;
  created_at?: string;
  updated_at?: string;
}

export interface Admins {
  id?: number;
  username: string;
  mobile: string;
  role: "admin" | "user";
  created_at?: string;
  otp: string;
  otp_expiry: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    // const token = localStorage.getItem('authToken');
    return {
      "Content-Type": "application/json",
      // ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Authentication APIs
  async registerUser(
    username: string,
    mobile: string,
    role: string
  ): Promise<{ user: Admins }> {
    try {
      const response = await fetch(`${BASE_URL}/Register`, {
        method: "POST",
        headers: this.getHeaders(),
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

  async login(mobile: string): Promise<{ user: Admins }> {
    try {
      const response = await fetch(`${BASE_URL}/Login`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      if (!data.user) {
        throw new Error("User not found");
      }
      return data;
      // localStorage.setItem('authToken', data.token);
      // return data;
    } catch (error) {
      console.error("Login error:", error);
      // Mock response for demo purposes
      // const mockUser = { id: 1, username: 'admin', email, role: 'admin' as const };
      // const mockToken = 'mock-jwt-token';
      // localStorage.setItem('authToken', mockToken);
      // return { error: "User not Found" };
    }
  }

  async validateOtp(mobile: string, otp: string): Promise<{ user: Admins }> {
    try {
      const response = await fetch(`${BASE_URL}/Validate-OTP`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ mobile, otp }),
      });

      if (!response.ok) throw new Error("OTP validation failed");
      const data = await response.json();
      if (!data.message) {
        throw new Error("Invalid OTP");
      }
      // localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error("OTP validation error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("authToken");
    // You can also call your backend logout endpoint here
  }

  //Members API

  async getMembers(): Promise<Member[]> {
    try {
      const response = await fetch(`${BASE_URL}/view-members`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch members");
      return await response.json();
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
        headers: this.getHeaders(),
        body: JSON.stringify(member),
      });

      if (!response.ok) throw new Error("Failed to register member");
      return await response.json();
    } catch (error) {
      console.error("Register member error:", error);
      throw error;
    }
  }

  //   // Members API
  //   async getMembers(): Promise<Admins[]> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/view-members`, {
  //         headers: this.getHeaders(),
  //       });

  //       if (!response.ok) throw new Error('Failed to fetch members');
  //       return await response.json();
  //     } catch (error) {
  //       console.error('Get members error:', error);
  //       // Mock data for demo
  //       // return mockMembers;
  //     }
  //   }

  //   async createMember(member: Omit<Admins, 'id'>): Promise<Admins> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/members`, {
  //         method: 'POST',
  //         headers: this.getHeaders(),
  //         body: JSON.stringify(member),
  //       });

  //       if (!response.ok) throw new Error('Failed to create member');
  //       return await response.json();
  //     } catch (error) {
  //       console.error('Create member error:', error);
  //       // Mock response
  //       return { ...member, id: Date.now() };
  //     }
  //   }

  //   async updateMember(id: number, member: Partial<Users>): Promise<Users> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/Users/${id}`, {
  //         method: 'PUT',
  //         headers: this.getHeaders(),
  //         body: JSON.stringify(member),
  //       });

  //       if (!response.ok) throw new Error('Failed to update member');
  //       return await response.json();
  //     } catch (error) {
  //       console.error('Update member error:', error);
  //       // Mock response
  //       return { ...member, id } as Member;
  //     }
  //   }

  //   async deleteMember(id: number): Promise<void> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/members/${id}`, {
  //         method: 'DELETE',
  //         headers: this.getHeaders(),
  //       });

  //       if (!response.ok) throw new Error('Failed to delete member');
  //     } catch (error) {
  //       console.error('Delete member error:', error);
  //     }
  //   }

  //   // Events API
  //   async getEvents(): Promise<Event[]> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/events`, {
  //         headers: this.getHeaders(),
  //       });

  //       if (!response.ok) throw new Error('Failed to fetch events');
  //       return await response.json();
  //     } catch (error) {
  //       console.error('Get events error:', error);
  //       // Mock data for demo
  //       return mockEvents;
  //     }
  //   }

  //   async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  //     try {
  //       const response = await fetch(`${BASE_URL}/events`, {
  //         method: 'POST',
  //         headers: this.getHeaders(),
  //         body: JSON.stringify(event),
  //       });

  //       if (!response.ok) throw new Error('Failed to create event');
  //       return await response.json();
  //     } catch (error) {
  //       console.error('Create event error:', error);
  //       // Mock response
  //       return { ...event, id: Date.now() };
  //     }
  //   }
  // }

  // // Mock data for demonstration
  // const mockMembers: Member[] = [
  //   {
  //     id: 1,
  //     mobile: '9876543210',
  //     name: 'Rajesh Kumar',
  //     parents_name: 'Suresh Kumar',
  //     address: '123 Anna Nagar, Chennai',
  //     education_qualification: 'B.A. Political Science',
  //     caste: 'BC',
  //     joining_details: 'Joined in 2020',
  //     party_member_number: 'ADMK001',
  //     voter_id: 'TN1234567890',
  //     aadhar_number: '1234-5678-9012',
  //     position: 'District Secretary',
  //     created_at: '2024-01-15',
  //   },
  //   {
  //     id: 2,
  //     mobile: '9876543211',
  //     name: 'Priya Selvam',
  //     parents_name: 'Selvam Raj',
  //     address: '456 T.Nagar, Chennai',
  //     education_qualification: 'M.A. Tamil Literature',
  //     caste: 'MBC',
  //     joining_details: 'Joined in 2019',
  //     party_member_number: 'ADMK002',
  //     voter_id: 'TN1234567891',
  //     aadhar_number: '1234-5678-9013',
  //     position: 'Youth Wing Leader',
  //     created_at: '2024-01-10',
  //   },
  // ];
}

export const apiService = new ApiService();
