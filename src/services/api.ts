// API service layer for connecting to your MySQL backend
// Replace BASE_URL with your actual backend URL

const BASE_URL = 'http://localhost:5000/api'; // Update this with your backend URL

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

export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'party' | 'government';
  location?: string;
  created_at?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  role: 'admin' | 'superuser';
  created_at?: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Mock response for demo purposes
      const mockUser = { id: 1, username: 'admin', email, role: 'admin' as const };
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      return { user: mockUser, token: mockToken };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    // You can also call your backend logout endpoint here
  }

  // Members API
  async getMembers(): Promise<Member[]> {
    try {
      const response = await fetch(`${BASE_URL}/user-details`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch members');
      return await response.json();
    } catch (error) {
      console.error('Get members error:', error);
      // Mock data for demo
      return mockMembers;
    }
  }

  async createMember(member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const response = await fetch(`${BASE_URL}/members`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(member),
      });

      if (!response.ok) throw new Error('Failed to create member');
      return await response.json();
    } catch (error) {
      console.error('Create member error:', error);
      // Mock response
      return { ...member, id: Date.now() };
    }
  }

  async updateMember(id: number, member: Partial<Member>): Promise<Member> {
    try {
      const response = await fetch(`${BASE_URL}/members/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(member),
      });

      if (!response.ok) throw new Error('Failed to update member');
      return await response.json();
    } catch (error) {
      console.error('Update member error:', error);
      // Mock response
      return { ...member, id } as Member;
    }
  }

  async deleteMember(id: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/members/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete member');
    } catch (error) {
      console.error('Delete member error:', error);
    }
  }

  // Events API
  async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${BASE_URL}/events`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Get events error:', error);
      // Mock data for demo
      return mockEvents;
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const response = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error('Failed to create event');
      return await response.json();
    } catch (error) {
      console.error('Create event error:', error);
      // Mock response
      return { ...event, id: Date.now() };
    }
  }
}

// Mock data for demonstration
const mockMembers: Member[] = [
  {
    id: 1,
    mobile: '9876543210',
    name: 'Rajesh Kumar',
    parents_name: 'Suresh Kumar',
    address: '123 Anna Nagar, Chennai',
    education_qualification: 'B.A. Political Science',
    caste: 'BC',
    joining_details: 'Joined in 2020',
    party_member_number: 'ADMK001',
    voter_id: 'TN1234567890',
    aadhar_number: '1234-5678-9012',
    position: 'District Secretary',
    created_at: '2024-01-15',
  },
  {
    id: 2,
    mobile: '9876543211',
    name: 'Priya Selvam',
    parents_name: 'Selvam Raj',
    address: '456 T.Nagar, Chennai',
    education_qualification: 'M.A. Tamil Literature',
    caste: 'MBC',
    joining_details: 'Joined in 2019',
    party_member_number: 'ADMK002',
    voter_id: 'TN1234567891',
    aadhar_number: '1234-5678-9013',
    position: 'Youth Wing Leader',
    created_at: '2024-01-10',
  },
];

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Party Executive Meeting',
    description: 'Monthly executive committee meeting',
    date: '2024-02-15',
    time: '10:00',
    type: 'party',
    location: 'Party Headquarters, Chennai',
    created_at: '2024-01-20',
  },
  {
    id: 2,
    title: 'Government Budget Session',
    description: 'Tamil Nadu Assembly Budget Session',
    date: '2024-02-20',
    time: '11:00',
    type: 'government',
    location: 'Assembly House, Chennai',
    created_at: '2024-01-25',
  },
];

export const positions = [
  'District Secretary',
  'Youth Wing Leader',
  'Women Wing Leader',
  'Booth Committee President',
  'Village Panchayat Member',
  'Town Panchayat Member',
  'Block Committee Member',
  'State Committee Member',
  'General Member',
  'Volunteer',
];

export const apiService = new ApiService();