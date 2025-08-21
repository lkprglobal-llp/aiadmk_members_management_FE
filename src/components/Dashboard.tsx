import { useState, useEffect } from 'react';
import { Search, Users, UserPlus, Calendar, Filter, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService, Member, positions } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onAddMember: () => void;
  onViewCalendar: () => void;
}

export function Dashboard({ onAddMember, onViewCalendar }: DashboardProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, selectedPosition, members]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMembers();
      setMembers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //   const handleExportMember = async (id: number) => {
  //   try {
  //     const blob = await apiService.exportMember(id);
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `member_${id}.csv`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //     toast({
  //       title: "Export successful",
  //       description: "Member data exported successfully.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to export member. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };


  //   const handleExportAllMembers = async () => {
  //   try {
  //     const blob = await apiService.exportAllMembers();
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'all_members.csv';
  //     a.click();
  //     URL.revokeObjectURL(url);
  //     toast({
  //       title: "Export successful",
  //       description: "All members data exported successfully.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to export members. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobile.includes(searchTerm) ||
        member.party_member_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPosition !== 'all') {
      filtered = filtered.filter(member => member.position === selectedPosition);
    }

    setFilteredMembers(filtered);
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      await apiService.deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    }
  };

  const stats = [
    {
      title: 'Total Members',
      value: members.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'New This Month',
      value: members.filter(m => {
        const memberDate = new Date(m.created_at || '');
        const thisMonth = new Date();
        return memberDate.getMonth() === thisMonth.getMonth() && 
               memberDate.getFullYear() === thisMonth.getFullYear();
      }).length,
      icon: UserPlus,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Positions Filled',
      value: new Set(members.map(m => m.position)).size,
      icon: Calendar,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage AIADMK party members and activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onViewCalendar} variant="outline" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>View Events</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </Button>
          <Button onClick={onAddMember} className="btn-hero flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Add New Member</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-gradient animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or member number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
            <div className="flex items-center justify-center py-8">
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
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Mobile</th>
                    <th className="text-left py-3 px-4 font-semibold">Member No.</th>
                    <th className="text-left py-3 px-4 font-semibold">Position</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.parents_name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-foreground">{member.mobile}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-mono">
                          {member.party_member_number}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">
                          {member.position}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="p-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-2 text-destructive hover:text-destructive"
                            onClick={() => member.id && handleDeleteMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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