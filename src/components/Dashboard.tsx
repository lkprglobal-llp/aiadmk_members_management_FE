// import { useState, useEffect, useMemo } from "react";
// import { Search, Users, UserPlus, Calendar, Filter, Eye, Edit, Trash2, Download } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { apiService, Member } from "@/services/api";
// import { useToast } from "@/hooks/use-toast";
// import { Value } from "@radix-ui/react-select";
// import { set } from "date-fns";

// interface DashboardProps {
//   onAddMember: () => void;
//   onViewCalendar: () => void;
// }

// interface Position {
//   dcode: string;
//   dname: string;
//   tcode: string;
//   tname: string;
//   jcode: string;
//   jname: string;
// }


// export function Dashboard({ onAddMember, onViewCalendar }: DashboardProps) {
//   const [members, setMembers] = useState<Member[]>([]);
//   const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [Positions, setPositions] = useState<Position[]>([]);
//   // const [selectedUnion, setSelectedUnion] = useState("all");
//   // const [selectedTeam, setSelectedTeam] = useState("all");
//   // const [selectedPosition, setSelectedPosition] = useState("all");
//   const [filters, setFilters] = useState({
//     union: "all",
//     team: "all",
//     job: "all",
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [editingMember, setEditingMember] = useState<Member | null>(null);
//   const { toast } = useToast();

//   // useEffect(() => {
//   //   fetchMembers();
//   //   fetchPositions();
//   // }, []);
//   useEffect(() => {
//     (async () => {
//       try {
//         const [membersData, positionsData] = await Promise.all([
//           apiService.getMembers(),
//           apiService.getPositions(),
//         ]);
//         setMembers(Array.isArray(membersData) ? membersData : []);
//         setPositions(Array.isArray(positionsData) ? positionsData.flat() : []);
//       } catch (err) {
//         toast({
//           title: "Error",
//           description: "Failed to fetch data",
//           variant: "destructive",
//         });
//       }
//     })();
//   }, []);

//   /** === Unique Values for Filters === */
//   const unions = useMemo(
//     () => [...new Set(Positions.map((p) => p.dname))],
//     [Positions]
//   );
//   const teams = useMemo(
//     () =>
//       [...new Set(Positions
//         .filter((p) => filters.union === "all" || p.dname === filters.union)
//         .map((p) => p.tname))],
//     [Positions, filters.union]
//   );
//   const jobs = useMemo(
//     () =>
//       [...new Set(Positions
//         .filter(
//           (p) =>
//             (filters.union === "all" || p.dname === filters.union) &&
//             (filters.team === "all" || p.tname === filters.team)
//         )
//         .map((p) => p.jname))],
//     [Positions, filters.union, filters.team]
//   );
//   // const fetchMembers = async () => {
//   //   try {
//   //     setIsLoading(true);
//   //     const data = await apiService.getMembers();
//   //     setMembers(Array.isArray(data) ? data : []);
//   //   } catch (error) {
//   //     console.error("Fetch members error:", error);
//   //     setMembers([]);
//   //     toast({
//   //       title: "Error",
//   //       description:
//   //         error.message === "Unauthorized"
//   //           ? "Session expired. Please log in again."
//   //           : "Failed to fetch members",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const fetchPositions = async () => {
//   //   try {
//   //     setIsLoading(true)
//   //     const response = await apiService.getPositions()


//   //     if (!response) {
//   //       throw new Error(`HTTP error! status: ${response}`);
//   //     }

//   //     if (Array.isArray(response)) {
//   //       // flatten only if necessary
//   //       const flattened: Position[] = response.flat();
//   //       setPositions(flattened);
//   //     }
//   //     else {
//   //       setPositions([])
//   //     }


//   //   } catch (error) {
//   //     console.error("Fetch positions error:", error);
//   //     // setPositions([]); // Fallback to empty array
//   //     toast({
//   //       title: "Error",
//   //       description: "Failed to fetch positions. Using default filter.",
//   //       variant: "destructive",
//   //     });
//   //   }
//   // };

//   // useEffect(() => {
//   //   filterMembers();
//   // }, [searchTerm, selectedUnion, selectedTeam, selectedPosition, members]);

//   /** === Filtered Members === */
//   const filterMembers = useMemo(() => {
//     return members.filter((m) => {
//       const matchesSearch =
//         !searchTerm ||
//         m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         m.mobile.includes(searchTerm) ||
//         m.party_member_number
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         m.jname.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesUnion =
//         filters.union === "all" || m.dname === filters.union;
//       const matchesTeam =
//         filters.team === "all" || m.tname === filters.team;
//       const matchesJob = filters.job === "all" || m.jname === filters.job;

//       return matchesSearch && matchesUnion && matchesTeam && matchesJob;
//     });
//   }, [members, searchTerm, filters]);

//   // useEffect(() => {
//   //   filterMembers();
//   // }, [searchTerm, selectedUnion, selectedTeam, selectedPosition, members]);

//   // const filterMembers = () => {
//   //   let filtered = Array.isArray(members) ? [...members] : [];
//   //   if (searchTerm) {
//   //     filtered = filtered.filter(
//   //       (member) =>
//   //         member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         member.mobile.includes(searchTerm) ||
//   //         member.party_member_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         member.jname.toLowerCase().includes(searchTerm.toLowerCase())
//   //     );
//   //   }
//   //   if (selectedPosition !== "all") {
//   //     filtered = filtered.filter(
//   //       (member) => member.jname === selectedPosition
//   //     );
//   //   }

//   //   if (selectedUnion !== "all") {
//   //     filtered = filtered.filter((m) => m.dname === selectedUnion);
//   //   }
//   //   if (selectedTeam !== "all") {
//   //     filtered = filtered.filter((m) => m.tname === selectedTeam);
//   //   }
//   //   if (selectedPosition !== "all") {
//   //     filtered = filtered.filter((m) => m.jname === selectedPosition);
//   //   }
//   //   setFilteredMembers(filtered);
//   // };

//   const handleDeleteMember = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this member?")) return;
//     try {
//       await apiService.deleteMember(id);
//       setMembers(members.filter((m) => m.id !== id));
//       toast({
//         title: "Success",
//         description: "Member deleted successfully",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete member",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleEditMember = (member: Member) => {
//     setEditingMember(member);
//   };

//   const handleUpdateMember = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!editingMember) return;
//     try {
//       const updatedMember = await apiService.updateMember(editingMember.id, {
//         name: editingMember.name,
//         mobile: editingMember.mobile,
//         parents_name: editingMember.parents_name,
//         address: editingMember.address,
//         education_qualification: editingMember.education_qualification,
//         caste: editingMember.caste,
//         joining_details: editingMember.joining_details,
//         party_member_number: editingMember.party_member_number,
//         voter_id: editingMember.voter_id,
//         aadhar_number: editingMember.aadhar_number,
//         image: editingMember.image,
//         position: editingMember.position,
//         jname: editingMember.jname,
//         tname: editingMember.tname,
//         dname: editingMember.dname,
//       });
//       setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
//       setEditingMember(null);
//       toast({
//         title: "Success",
//         description: "Member updated successfully",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update member",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleViewMember = (member: Member) => {
//     toast({
//       title: "Member Details",
//       description: `Image:${member.image}, Name: ${member.name}, Mobile: ${member.mobile}, Position: ${member.jname}, Member No: ${member.party_member_number}`,
//     });
//   };

//   const handleExportMember = async (member: Member) => {
//     try {
//       const blob = await apiService.exportMember(member.id);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `member_${member.name}.csv`;
//       a.click();
//       URL.revokeObjectURL(url);
//       toast({
//         title: "Export successful",
//         description: "Member data exported successfully.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to export member. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleExportAllMembers = async () => {
//     try {
//       const blob = await apiService.exportAllMembers();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "all_members.csv";
//       a.click();
//       URL.revokeObjectURL(url);
//       toast({
//         title: "Export successful",
//         description: "All members data exported successfully.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to export members. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };


//   //stats data
//   const stats = [
//     {
//       title: "Total Members",
//       value: members.length,
//       icon: Users,
//       color: "text-primary",
//       bgColor: "bg-primary/10",
//     },
//     {
//       title: "New This Month",
//       value: Array.isArray(members)
//         ? members.filter((m) => {
//           const memberDate = new Date(m.created_at || "");
//           const thisMonth = new Date();
//           return (
//             memberDate.getMonth() === thisMonth.getMonth() &&
//             memberDate.getFullYear() === thisMonth.getFullYear()
//           );
//         }).length
//         : 0,
//       icon: UserPlus,
//       color: "text-accent",
//       bgColor: "bg-accent/10",
//     },
//     {
//       title: "Positions Filled",
//       value: Array.isArray(members) ? new Set(members.map((m) => m.jname)).size : 0,
//       icon: Calendar,
//       color: "text-secondary",
//       bgColor: "bg-secondary/10",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
//           <p className="text-muted-foreground">Manage AIADMK party members and activities</p>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-3">
//           <Button
//             onClick={onViewCalendar}
//             variant="outline"
//             className="flex items-center space-x-2"
//           >
//             <Calendar className="w-4 h-4" />
//             <span>View Events</span>
//           </Button>
//           <Button
//             onClick={handleExportAllMembers}
//             variant="outline"
//             className="flex items-center space-x-2"
//           >
//             <Download className="w-4 h-4" />
//             <span>Export All</span>
//           </Button>
//           <Button onClick={onAddMember} className="btn-hero flex items-center space-x-2">
//             <UserPlus className="w-4 h-4" />
//             <span>Add New Member</span>
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <Card
//               key={index}
//               className="card-gradient animate-slide-up"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                     <p className="text-3xl font-bold text-foreground">{stat.value}</p>
//                   </div>
//                   <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
//                     <Icon className={`w-6 h-6 ${stat.color}`} />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Edit Member Form */}
//       {editingMember && (
//         <Card className="card-gradient mb-6">
//           <CardHeader>
//             <CardTitle>Edit Member</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleUpdateMember} className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Name</label>
//                 <Input
//                   value={editingMember.name}
//                   onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Mobile</label>
//                 <Input
//                   value={editingMember.mobile}
//                   onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
//                 />
//               </div>
//               {/* For Union Change */}
//               <div>
//                 <label className="text-sm font-medium">Union</label>
//                 <Select
//                   value={editingMember.dname || ""}
//                   onValueChange={(value) => setEditingMember({ ...editingMember, dname: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select position" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.isArray(Positions) && Positions.length > 0 ? (
//                       Positions.map((pos) => (
//                         <SelectItem key={pos.dname} value={pos.dname || "unknown"}>
//                           {pos.dname || "Unknown Position"}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <SelectItem value="no-positions" disabled>
//                         No Union available
//                       </SelectItem>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* For Team Change */}
//               <div>
//                 <label className="text-sm font-medium">Team</label>
//                 <Select
//                   value={editingMember.tname || ""}
//                   onValueChange={(value) => setEditingMember({ ...editingMember, tname: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select position" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.isArray(Positions) && Positions.length > 0 ? (
//                       Positions.map((pos) => (
//                         <SelectItem key={pos.tcode} value={pos.tname || "unknown"}>
//                           {pos.tname || "Unknown Position"}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <SelectItem value="no-positions" disabled>
//                         No Team available
//                       </SelectItem>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* For Position Change */}
//               <div>
//                 <label className="text-sm font-medium">Position</label>
//                 <Select
//                   value={editingMember.jname || ""}
//                   onValueChange={(value) => setEditingMember({ ...editingMember, jname: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select position" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Array.isArray(Positions) && Positions.length > 0 ? (
//                       Positions.map((pos) => (
//                         <SelectItem key={pos.jcode} value={pos.jname || "unknown"}>
//                           {pos.jname || "Unknown Position"}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <SelectItem value="no-positions" disabled>
//                         No positions available
//                       </SelectItem>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Parent's Name</label>
//                 <Input
//                   value={editingMember.parents_name || ""}
//                   onChange={(e) =>
//                     setEditingMember({ ...editingMember, parents_name: e.target.value })
//                   }
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Button type="submit">Save Changes</Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setEditingMember(null)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Filters */}
//       <Card className="card-gradient">
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Filter className="w-5 h-5" />
//             <span>Filter Members</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search by name, mobile, or member number..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div className="w-full md:w-64">
//               <Select value={filters.union} onValueChange={(value) => setFilters((f) => ({ ...f, union: value, team: "all", job: "all" }))}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by Union" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All union</SelectItem>
//                   {Array.isArray(unions) && unions.length > 0 ? (
//                     unions.map((union, index) => (
//                       <SelectItem key={`${union}-${index}`} value={union || "unknown"}>
//                         {union || "Unknown Position"}
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <SelectItem value="no-positions" disabled>
//                       No positions available
//                     </SelectItem>
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-64">
//               <Select value={filters.team} onValueChange={(value) => setFilters((f) => ({ ...f, team: value, job: "all" }))}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by Team" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Team</SelectItem>
//                   {Array.isArray(teams) && teams.length > 0 ? (
//                     teams.map((team, index) => (
//                       <SelectItem key={`${team}-${index}`} value={team || "unknown"}>
//                         {team || "Unknown Position"}
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <SelectItem value="no-positions" disabled>
//                       No positions available
//                     </SelectItem>
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-64">
//               <Select value={filters.job} onValueChange={(value) => setFilters((f) => ({ ...f, job: value }))}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by Job" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Position</SelectItem>
//                   {Array.isArray(jobs) && jobs.length > 0 ? (
//                     jobs.map((jobs, index) => (
//                       <SelectItem key={`${jobs}-${index}`} value={jobs || "unknown"}>
//                         {jobs || "Unknown Position"}
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <SelectItem value="no-positions" disabled>
//                       No positions available
//                     </SelectItem>
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Members Table */}
//       <Card className="card-gradient">
//         <CardHeader>
//           <CardTitle>Members ({filteredMembers.length})</CardTitle>
//           <CardDescription>Complete list of AIADMK party members</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : filteredMembers.length === 0 ? (
//             <div className="text-center py-8">
//               <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground">No members found</p>
//               <Button onClick={onAddMember} className="mt-4 btn-hero">
//                 Add First Member
//               </Button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-border">
//                     <th className="text-left py-3 px-4 font-semibold">Name</th>
//                     <th className="text-left py-3 px-4 font-semibold">Mobile</th>
//                     <th className="text-left py-3 px-4 font-semibold">Member No.</th>
//                     <th className="text-left py-3 px-4 font-semibold">Position</th>
//                     <th className="text-left py-3 px-4 font-semibold">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredMembers.map((member) => (
//                     <tr
//                       key={member.id}
//                       className="border-b border-border/50 hover:bg-muted/30 transition-colors"
//                     >
//                       <td className="py-4 px-4">
//                         <div>
//                           <p className="font-medium text-foreground">{member.name}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {member.parents_name}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="py-4 px-4 text-foreground">{member.mobile}</td>
//                       <td className="py-4 px-4">
//                         <Badge variant="outline" className="font-mono">
//                           {member.party_member_number}
//                         </Badge>
//                       </td>
//                       <td className="py-4 px-4">
//                         <Badge variant="secondary">{member.jname}</Badge>
//                       </td>
//                       <td className="py-4 px-4">
//                         <div className="flex space-x-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="p-2"
//                             onClick={() => handleViewMember(member)}
//                           >
//                             <Eye className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="p-2"
//                             onClick={() => handleEditMember(member)}
//                           >
//                             <Edit className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="p-2"
//                             onClick={() => handleExportMember(member.name ? member : member)}
//                           >
//                             <Download className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="p-2 text-destructive hover:text-destructive"
//                             onClick={() => handleDeleteMember(member.id)}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
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
import { useToast } from "@/hooks/use-toast";

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
  }, []);

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
  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await apiService.deleteMember(id);
      setMembers(members.filter((m) => m.id !== id));
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
      const updatedMember = await apiService.updateMember(editingMember.id, {
        ...editingMember,
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
      );
      setEditingMember(null);
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
    }
  };

  const handleViewMember = (member: Member) => {
    toast({
      title: "Member Details",
      description: `Name: ${member.name}, Mobile: ${member.mobile}, Position: ${member.jname}, Member No: ${member.party_member_number}`,
    });
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

  return (
    <div className="space-y-6">
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

      {/* Filters */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filter Members
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or member number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Union Filter */}
          <Select
            value={filters.union}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, union: value, team: "all", job: "all" }))
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
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((j, i) => (
                <SelectItem key={i} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Members ({filteredMembers.length})</CardTitle>
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
            <div className="text-center py-8">
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
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Member No.</th>
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.parents_name}
                        </p>
                      </td>
                      <td className="py-3 px-4">{m.mobile}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{m.party_member_number}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{m.jname}</Badge>
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMember(m)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
                          onClick={() => handleDeleteMember(m.id)}
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
    </div>
  );
}
