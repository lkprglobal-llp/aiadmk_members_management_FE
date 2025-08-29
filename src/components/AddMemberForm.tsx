import { useState } from 'react';
import { UserPlus, Save, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService, Member, Admins } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AddMemberFormProps {
  onBack: () => void;
  onMemberAdded: () => void;
}

export function AddMemberForm({ onBack, onMemberAdded }: AddMemberFormProps) {
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    mobile: '',
    name: '',
    parents_name: '',
    address: '',
    education_qualification: '',
    caste: '',
    joining_details: '',
    party_member_number: '',
    voter_id: '',
    aadhar_number: '',
    image: '',
    position: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const required = ['mobile', 'name', 'parents_name', 'address', 'party_member_number', 'position'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return false;
    }

    // Validate Aadhar number format
    if (formData.aadhar_number && !/^\d{4}-\d{4}-\d{4}$/.test(formData.aadhar_number)) {
      toast({
        title: "Validation Error",
        description: "Aadhar number should be in format: 1234-5678-9012",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // await apiService.createMember(formData);
      // toast({
      //   title: "Success",
      //   description: "Member added successfully!",
      // });
      // onMemberAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <UserPlus className="w-8 h-8 text-primary" />
            <span>Add New Member</span>
          </h1>
          <p className="text-muted-foreground">Add a new member to the AIADMK party</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="card-gradient animate-fade-in">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic member details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parents_name">Father's/Mother's Name *</Label>
                <Input
                  id="parents_name"
                  placeholder="Enter parent's name"
                  value={formData.parents_name}
                  onChange={(e) => handleInputChange('parents_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caste">Caste</Label>
                <Input
                  id="caste"
                  placeholder="Enter caste"
                  value={formData.caste}
                  onChange={(e) => handleInputChange('caste', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education_qualification">Education Qualification</Label>
              <Input
                id="education_qualification"
                placeholder="e.g., B.A., M.A., B.E., etc."
                value={formData.education_qualification}
                onChange={(e) => handleInputChange('education_qualification', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Party Information */}
        <Card className="card-gradient animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Party Information</CardTitle>
            <CardDescription>Party membership and position details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party_member_number">Party Member Number *</Label>
                <Input
                  id="party_member_number"
                  placeholder="ADMK001"
                  value={formData.party_member_number}
                  onChange={(e) => handleInputChange('party_member_number', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))} */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining_details">Joining Details</Label>
              <Textarea
                id="joining_details"
                placeholder="When and how did they join the party?"
                value={formData.joining_details}
                onChange={(e) => handleInputChange('joining_details', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Official Documents */}
        <Card className="card-gradient animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Official Documents</CardTitle>
            <CardDescription>Government ID and verification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voter_id">Voter ID</Label>
                <Input
                  id="voter_id"
                  placeholder="TN1234567890"
                  value={formData.voter_id}
                  onChange={(e) => handleInputChange('voter_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhar_number">Aadhar Number</Label>
                <Input
                  id="aadhar_number"
                  placeholder="1234-5678-9012"
                  value={formData.aadhar_number}
                  onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="w-16 h-16 border-2 border-border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" onClick={onBack} variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="btn-hero min-w-[150px]">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Add Member</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}