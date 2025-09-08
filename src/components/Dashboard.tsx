import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  UserPlus,
  Calendar,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService, Member } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast";

const BASE_URL = "http://localhost:5253/"; // Update this with your backend URL

interface DashboardProps {
  onAddMember: () => void;
  onViewCalendar: () => void;
}

interface Position {
  dcode: string;
  dname: string;
  tcode: string;
  tname: string;
  jcode: string;
  jname: string;
}

export function Dashboard({ onAddMember, onViewCalendar }: DashboardProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    union: "all",
    team: "all",
    job: "all",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [membersData, positionsData] = await Promise.all([
          apiService.getMembers(),
          apiService.getPositions(),
        ]);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setPositions(Array.isArray(positionsData) ? positionsData.flat() : []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  /** === Unique Values for Filters === */
  const unions = useMemo(
    () => [...new Set(positions.map((p) => p.dname))],
    [positions]
  );
  const teams = useMemo(
    () =>
      [
        ...new Set(
          positions
            .filter(
              (p) => filters.union === "all" || p.dname === filters.union
            )
            .map((p) => p.tname)
        ),
      ],
    [positions, filters.union]
  );
  const jobs = useMemo(
    () =>
      [
        ...new Set(
          positions
            .filter(
              (p) =>
                (filters.union === "all" || p.dname === filters.union) &&
                (filters.team === "all" || p.tname === filters.team)
            )
            .map((p) => p.jname)
        ),
      ],
    [positions, filters.union, filters.team]
  );

  /** === Filtered Members === */
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !searchTerm ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mobile.includes(searchTerm) ||
        m.party_member_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        m.jname.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUnion =
        filters.union === "all" || m.dname === filters.union;
      const matchesTeam =
        filters.team === "all" || m.tname === filters.team;
      const matchesJob = filters.job === "all" || m.jname === filters.job;

      return matchesSearch && matchesUnion && matchesTeam && matchesJob;
    });
  }, [members, searchTerm, filters]);

  /** === CRUD Handlers (Delete, Edit, Export etc.) === */
  const handleDeleteMember = async (member: Member) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await apiService.deleteMember(member.id);
      setMembers(members.filter((m) => m.id !== member.id));
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
  };


  const handleUpdateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const formData = new FormData();

      // append all text fields safely
      formData.append("mobile", editingMember.mobile || "");
      formData.append("name", editingMember.name || "");
      formData.append("parents_name", editingMember.parents_name || "");
      formData.append("address", editingMember.address || "");
      formData.append("education_qualification", editingMember.education_qualification || "");
      formData.append("caste", editingMember.caste || "");

      // ✅ handle joining_date safely
      // if (editingMember.joining_date) {
      //   const dateValue =
      //     editingMember.joining_date instanceof string
      //       ? editingMember.joining_date.toISOString().split("T")[0]
      //       : new Date(editingMember.joining_date).toISOString().split("T")[0];

      //   formData.append("joining_date", dateValue);
      // } else {
      //   formData.append("joining_date", "");
      // }
      formData.append("joining_date", editingMember.joining_date || "");
      formData.append("joining_details", editingMember.joining_details || "");
      formData.append("party_member_number", editingMember.party_member_number || "");
      formData.append("voter_id", editingMember.voter_id || "");
      formData.append("aadhar_number", editingMember.aadhar_number || "");
      formData.append("jname", editingMember.jname || "");
      formData.append("tname", editingMember.tname || "");
      formData.append("dname", editingMember.dname || "");

      // ✅ handle image correctly
      if (editingMember.image instanceof File) {
        formData.append("image", editingMember.image);
      }

      // call API
      const updatedMember = await apiService.updateMember(editingMember.id, formData);

      // update local state
      setMembers((prev) =>
        prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
      );
      setEditingMember(null);

      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
    }
  };


  const handleViewMember = (member: Member) => {
    // toast({
    //   title: "Member Details",
    //   description: `Name: ${member.name}, Mobile: ${member.mobile}, Position: ${member.jname}, Member No: ${member.party_member_number}`,
    // });

  };

  const handleExportMember = async (member: Member) => {
    try {
      const blob = await apiService.exportMember(member.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `member_${member.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Export successful",
        description: "Member data exported successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to export member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAllMembers = async () => {
    try {
      const blob = await apiService.exportAllMembers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_members.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Export successful",
        description: "All members data exported successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to export members. Please try again.",
        variant: "destructive",
      });
    }
  };

  /** === Stats Cards === */
  const stats = [
    {
      title: "Total Members",
      value: members.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "New This Month",
      value: members.filter((m) => {
        const memberDate = new Date(m.created_at || "");
        const thisMonth = new Date();
        return (
          memberDate.getMonth() === thisMonth.getMonth() &&
          memberDate.getFullYear() === thisMonth.getFullYear()
        );
      }).length,
      icon: UserPlus,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Positions Filled",
      value: new Set(members.map((m) => m.jname)).size,
      icon: Calendar,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];


  const carouselImages = [
    "../../public/images/headerimage/Website card design - Dashboard.jpg",
    "../../public/images/headerimage/2 Website card design - Dashboard copy 2.jpg",
    "../../public/images/headerimage/3 Website card design - Dashboard copy 3.jpg",
    "../../public/images/headerimage/4 Website card design - Dashboard copy 4.jpg"
  ];
  return (
    <div className="space-y-6">
      <Carousel
        className="w-full max-w-10xl mx-auto"
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 1800,
            stopOnInteraction: false, // keep autoplay alive
            stopOnMouseEnter: true //stop when enter the mouse
          }),
        ]}
      >
        <CarouselContent>
          {carouselImages.map((src, idx) => (
            <CarouselItem key={idx} className="flex justify-center items-center">
              <img
                src={src}
                alt={`carousel-img-${idx}`}
                className="rounded-2xl shadow-lg   w-full h-[100px]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage AIADMK party members and activities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onViewCalendar} variant="outline">
            <Calendar className="w-4 h-4 mr-2" /> View Events
          </Button>
          <Button onClick={handleExportAllMembers} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export All
          </Button>
          <Button onClick={onAddMember} className="btn-hero">
            <UserPlus className="w-4 h-4 mr-2" /> Add New Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="card-gradient animate-slide-up">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/*  Edit Member Form */}
      {editingMember && (
        <Card className="card-gradient mb-6">
          <CardHeader>
            <CardTitle>Edit Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="text-sm font-medium">Mobile</label>
                <Input
                  value={editingMember.mobile}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, mobile: e.target.value })
                  }
                />
              </div>

              {/* Union */}
              <div>
                <label className="text-sm font-medium">Union</label>
                <Select
                  value={editingMember.dname || ""}
                  onValueChange={(value) =>
                    setEditingMember({ ...editingMember, dname: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select union" />
                  </SelectTrigger>
                  <SelectContent>
                    {unions.length > 0 ? (
                      unions.map((pos, i) => (
                        <SelectItem key={i} value={pos || "unknown"}>
                          {pos}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-positions" disabled>
                        No Union available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Team */}
              <div>
                <label className="text-sm font-medium">Team</label>
                <Select
                  value={editingMember.tname || ""}
                  onValueChange={(value) =>
                    setEditingMember({ ...editingMember, tname: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.length > 0 ? (
                      teams.map((pos, i) => (
                        <SelectItem key={i} value={pos || "unknown"}>
                          {pos}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-positions" disabled>
                        No Team available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Position */}
              <div>
                <label className="text-sm font-medium">Position</label>
                <Select
                  value={editingMember.jname || ""}
                  onValueChange={(value) =>
                    setEditingMember({ ...editingMember, jname: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.length > 0 ? (
                      jobs.map((pos, i) => (
                        <SelectItem key={i} value={pos || "unknown"}>
                          {pos}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-positions" disabled>
                        No positions available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Father's Name */}
              <div>
                <label className="text-sm font-medium">Father's Name</label>
                <Input
                  value={editingMember.parents_name || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      parents_name: e.target.value,
                    })
                  }
                />
              </div>

              {/* AIADMK Number */}
              <div>
                <label className="text-sm font-medium">Father's Name</label>
                <Input
                  value={editingMember.party_member_number || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      party_member_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="text-sm font-medium">Joining Date</label>
                <Input
                  type="date"
                  value={editingMember.joining_date.split("T")[0]}
                  placeholder="June 01, 2025"
                  className="bg-background pr-10"
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      joining_date: e.target.value,
                    })
                  }
                />
              </div>

              {/* Joining Details */}
              <div>
                <label className="text-sm font-medium">Joining Notes</label>
                <Input
                  placeholder="e.g., Joined during 2024 campaign"
                  value={editingMember.joining_details || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      joining_details: e.target.value,
                    })
                  }
                />
              </div>


              {/* Image Upload */}
              <div>
                <label>Profile Image</label>
                {editingMember?.image && (
                  <div className="mb-2">
                    {editingMember.image instanceof File ? (
                      // Show preview for newly uploaded file
                      <img
                        src={URL.createObjectURL(editingMember.image)}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      // Show existing image from server
                      <img
                        src={`${BASE_URL}${editingMember.image}`}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingMember((prev) =>
                      prev ? { ...prev, image: e.target.files?.[0] || prev.image } : prev
                    )
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 gap-2">
            <Filter className="w-5 h-5" />
            Filter Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isExpanded ? "Search Members" : ''}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`border border-gray-300 rounded-md p-2 
                        ${isExpanded ? 'w-64' : 'w-20'} 
                        transition-all duration-300 ease-in-out pl-10`}
                  onFocus={() => setIsExpanded(true)}
                  onBlur={() => setIsExpanded(false)} //Optional:collapse on blur
                />
              </div>
            </div>

            {/* Union Filter */}
            <Select
              value={filters.union}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, union: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Union" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Unions</SelectItem>
                {unions.map((u, i) => (
                  <SelectItem key={i} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Team Filter */}
            <Select
              value={filters.team}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, team: value, job: "all" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t, i) => (
                  <SelectItem key={i} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Job Filter */}
            <Select
              value={filters.job}
              onValueChange={(value) => setFilters((f) => ({ ...f, job: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs.map((j, i) => (
                  <SelectItem key={i} value={j}>
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Complete list of AIADMK party members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 ">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members found</p>
              <Button onClick={onAddMember} className="mt-4 btn-hero">
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">MemberId</th>
                    <th className="text-left py-3 px-4">Image</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Father's Name</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Union</th>
                    <th className="text-left py-3 px-4">Team</th>
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4"><p className="font-medium">{m.party_member_number.slice(8)}</p></td>
                      <td className="py-3 px-4"><img className="w-20 h-20 rounded-full object-cover bg-transparent" src={`${BASE_URL}${m.image}`} alt="user image" />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{m.name}</p>
                      </td>
                      <td className="py-3 px-4"><p className="font-medium">
                        {m.parents_name}
                      </p></td>
                      <td className="py-3 px-4">{m.mobile}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{m.dname}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{m.tname}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{m.jname}</Badge>
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewMember(m)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Members Details</DialogTitle>
                              <DialogDescription>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div className="col-span-2 flex justify-center">
                                    <img
                                      src={`${BASE_URL}${m.image}`}
                                      alt="Profile"
                                      className="h-24 w-24 rounded-full object-cover"
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold">Name:</p>
                                    <p>{m.name}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Father's Name:</p>
                                    <p>{m.parents_name}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Date of Birth:</p>
                                    <p>{m.date_of_birth.split("T")[0]}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Mobile:</p>
                                    <p>{m.mobile}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Party Member No:</p>
                                    <p>{m.party_member_number}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Voter ID:</p>
                                    <p>{m.voter_id}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Aadhar No:</p>
                                    <p>{m.aadhar_number}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Education:</p>
                                    <p>{m.education_qualification}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Caste:</p>
                                    <p>{m.caste}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Joining Date:</p>
                                    <p>{m.joining_date.split("T")[0]}</p>
                                  </div>

                                  <div className="col-span-2">
                                    <p className="font-semibold">Joining Notes:</p>
                                    <p>{m.joining_details}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Union:</p>
                                    <p>{m.dname}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Team:</p>
                                    <p>{m.tname}</p>
                                  </div>

                                  <div>
                                    <p className="font-semibold">Position:</p>
                                    <p>{m.jname}</p>
                                  </div>

                                  <div className="col-span-2">
                                    <p className="font-semibold">Address:</p>
                                    <p>{m.address}</p>
                                  </div>
                                </div>

                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMember(m)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportMember(m)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDeleteMember(m)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
