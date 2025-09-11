// import { useState } from 'react';
// import { UserPlus, Save, ArrowLeft, Upload } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { apiService, Member, Admins } from '@/services/api';
// import { useToast } from '@/hooks/use-toast';

// interface AddMemberFormProps {
//   onBack: () => void;
//   onMemberAdded: () => void;
// }

// export function AddMemberForm({ onBack, onMemberAdded }: AddMemberFormProps) {
//   const [formData, setFormData] = useState()

//   const [isLoading, setIsLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>('');
//   const { toast } = useToast();

//   const handleInputChange = (field: keyof typeof formData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const result = reader.result as string;
//         setImagePreview(result);
//         setFormData(prev => ({ ...prev, image: result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateForm = () => {
//     const required = ['mobile', 'name', 'parents_name', 'address', 'party_member_number', 'position'];
//     const missing = required.filter(field => !formData[field as keyof typeof formData]);

//     if (missing.length > 0) {
//       toast({
//         title: "Validation Error",
//         description: `Please fill in: ${missing.join(', ')}`,
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Validate mobile number
//     if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
//       toast({
//         title: "Validation Error",
//         description: "Please enter a valid 10-digit mobile number",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Validate Aadhar number format
//     if (formData.aadhar_number && !/^\d{4}-\d{4}-\d{4}$/.test(formData.aadhar_number)) {
//       toast({
//         title: "Validation Error",
//         description: "Aadhar number should be in format: 1234-5678-9012",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       // await apiService.createMember(formData);
//       // toast({
//       //   title: "Success",
//       //   description: "Member added successfully!",
//       // });
//       // onMemberAdded();
//       await apiService.registerMember(formData);
//       toast({
//         title: "Success",
//         description: "Member added successfully!",
//       });
//       onMemberAdded();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add member. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Button onClick={onBack} variant="outline" size="sm">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
//             <UserPlus className="w-8 h-8 text-primary" />
//             <span>Add New Member</span>
//           </h1>
//           <p className="text-muted-foreground">Add a new member to the AIADMK party</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Personal Information */}
//         <Card className="card-gradient animate-fade-in">
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//             <CardDescription>Basic member details and contact information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full Name *</Label>
//                 <Input
//                   id="name"
//                   placeholder="Enter full name"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="parents_name">Father's/Mother's Name *</Label>
//                 <Input
//                   id="parents_name"
//                   placeholder="Enter parent's name"
//                   value={formData.parents_name}
//                   onChange={(e) => handleInputChange('parents_name', e.target.value)}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="mobile">Mobile Number *</Label>
//                 <Input
//                   id="mobile"
//                   type="tel"
//                   placeholder="9876543210"
//                   value={formData.mobile}
//                   onChange={(e) => handleInputChange('mobile', e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="caste">Caste</Label>
//                 <Input
//                   id="caste"
//                   placeholder="Enter caste"
//                   value={formData.caste}
//                   onChange={(e) => handleInputChange('caste', e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="address">Address *</Label>
//               <Textarea
//                 id="address"
//                 placeholder="Enter complete address"
//                 value={formData.address}
//                 onChange={(e) => handleInputChange('address', e.target.value)}
//                 required
//                 rows={3}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="education_qualification">Education Qualification</Label>
//               <Input
//                 id="education_qualification"
//                 placeholder="e.g., B.A., M.A., B.E., etc."
//                 value={formData.education_qualification}
//                 onChange={(e) => handleInputChange('education_qualification', e.target.value)}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Party Information */}
//         <Card className="card-gradient animate-fade-in" style={{ animationDelay: '0.2s' }}>
//           <CardHeader>
//             <CardTitle>Party Information</CardTitle>
//             <CardDescription>Party membership and position details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="party_member_number">Party Member Number *</Label>
//                 <Input
//                   id="party_member_number"
//                   placeholder="ADMK001"
//                   value={formData.party_member_number}
//                   onChange={(e) => handleInputChange('party_member_number', e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="position">Position *</Label>
//                 <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select position" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {/* {positions.map((position) => (
//                       <SelectItem key={position} value={position}>
//                         {position}
//                       </SelectItem>
//                     ))} */}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="joining_details">Joining Details</Label>
//               <Textarea
//                 id="joining_details"
//                 placeholder="When and how did they join the party?"
//                 value={formData.joining_details}
//                 onChange={(e) => handleInputChange('joining_details', e.target.value)}
//                 rows={2}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Official Documents */}
//         <Card className="card-gradient animate-fade-in" style={{ animationDelay: '0.4s' }}>
//           <CardHeader>
//             <CardTitle>Official Documents</CardTitle>
//             <CardDescription>Government ID and verification details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="voter_id">Voter ID</Label>
//                 <Input
//                   id="voter_id"
//                   placeholder="TN1234567890"
//                   value={formData.voter_id}
//                   onChange={(e) => handleInputChange('voter_id', e.target.value)}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="aadhar_number">Aadhar Number</Label>
//                 <Input
//                   id="aadhar_number"
//                   placeholder="1234-5678-9012"
//                   value={formData.aadhar_number}
//                   onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Image Upload */}
//             <div className="space-y-2">
//               <Label htmlFor="image">Profile Photo</Label>
//               <div className="flex items-center space-x-4">
//                 <div className="flex-1">
//                   <Input
//                     id="image"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="cursor-pointer"
//                   />
//                 </div>
//                 {imagePreview && (
//                   <div className="w-16 h-16 border-2 border-border rounded-lg overflow-hidden">
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Submit Button */}
//         <div className="flex justify-end space-x-4 pt-6">
//           <Button type="button" onClick={onBack} variant="outline">
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isLoading} className="btn-hero min-w-[150px]">
//             {isLoading ? (
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
//                 <span>Adding...</span>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-2">
//                 <Save className="w-4 h-4" />
//                 <span>Add Member</span>
//               </div>
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
// import { useState } from "react";
// import { UserPlus, Save, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { apiService, Member } from "@/services/api";
// import { useToast } from "@/hooks/use-toast";

// interface AddMemberFormProps {
//   onBack: () => void;
//   onMemberAdded: () => void;
// }

// export function AddMemberForm({ onBack, onMemberAdded }: AddMemberFormProps) {
//   const [formData, setFormData] = useState({
//     mobile: "",
//     name: "",
//     parents_name: "",
//     address: "",
//     education_qualification: "",
//     caste: "",
//     joining_date: "",
//     joining_details: "",
//     party_member_number: "",
//     voter_id: "",
//     aadhar_number: "",
//     image: null as File | null,
//     created_at: "",
//     updated_at: "",
//     tname: "",
//     dname: "",
//     jname: ""
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>("");
//   const { toast } = useToast();

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, image: file }));
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const validateForm = () => {
//     const required = ["mobile", "name", "parents_name", "address", "party_member_number", "position"];
//     const missing = required.filter((field) => !formData[field as keyof typeof formData]);

//     if (missing.length > 0) {
//       toast({
//         title: "Validation Error",
//         description: `Please fill in: ${missing.join(", ")}`,
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
//       toast({
//         title: "Validation Error",
//         description: "Please enter a valid 10-digit mobile number",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (formData.aadhar_number && !/^\d{12}$/.test(formData.aadhar_number)) {
//       toast({
//         title: "Validation Error",
//         description: "Aadhar number should be 12 digits",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       const data: Member = new FormData();
//       Object.entries(formData).forEach(([key, value]) => {
//         if (value) data.append(key, value);
//       });

//       await apiService.registerMember(data);

//       toast({
//         title: "Success",
//         description: "Member added successfully!",
//       });
//       onMemberAdded();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add member. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Button onClick={onBack} variant="outline" size="sm">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
//             <UserPlus className="w-8 h-8 text-primary" />
//             <span>Add New Member</span>
//           </h1>
//           <p className="text-muted-foreground">Add a new member to the AIADMK party</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Personal Information */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//             <CardDescription>Basic member details and contact information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//                 id="name"
//                 placeholder="Full Name *"
//                 value={formData.name}
//                 onChange={(e) => handleInputChange("name", e.target.value)}
//                 required
//               />
//               <Input
//                 id="parents_name"
//                 placeholder="Father's/Mother's Name *"
//                 value={formData.parents_name}
//                 onChange={(e) => handleInputChange("parents_name", e.target.value)}
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//                 id="mobile"
//                 type="tel"
//                 placeholder="Mobile Number *"
//                 value={formData.mobile}
//                 onChange={(e) => handleInputChange("mobile", e.target.value)}
//                 required
//               />
//               <Input
//                 id="caste"
//                 placeholder="Caste"
//                 value={formData.caste}
//                 onChange={(e) => handleInputChange("caste", e.target.value)}
//               />
//             </div>
//             <Textarea
//               id="address"
//               placeholder="Address *"
//               value={formData.address}
//               onChange={(e) => handleInputChange("address", e.target.value)}
//               required
//               rows={3}
//             />
//             <Input
//               id="education_qualification"
//               placeholder="Education Qualification"
//               value={formData.education_qualification}
//               onChange={(e) => handleInputChange("education_qualification", e.target.value)}
//             />
//           </CardContent>
//         </Card>

//         {/* Party Info */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Party Information</CardTitle>
//             <CardDescription>Membership and position details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Input
//               id="party_member_number"
//               placeholder="Party Member Number *"
//               value={formData.party_member_number}
//               onChange={(e) => handleInputChange("party_member_number", e.target.value)}
//               required
//             />
//             <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Position *" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="district_secretary">District Secretary</SelectItem>
//                 <SelectItem value="union_secretary">Union Secretary</SelectItem>
//                 <SelectItem value="member">Member</SelectItem>
//               </SelectContent>
//             </Select>
//             <Input
//               type="date"
//               id="joining_date"
//               value={formData.joining_date}
//               onChange={(e) => handleInputChange("joining_date", e.target.value)}
//             />
//             <Textarea
//               id="joining_details"
//               placeholder="Joining Details"
//               value={formData.joining_details}
//               onChange={(e) => handleInputChange("joining_details", e.target.value)}
//             />
//           </CardContent>
//         </Card>

//         {/* Documents */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Official Documents</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Input
//               id="voter_id"
//               placeholder="Voter ID"
//               value={formData.voter_id}
//               onChange={(e) => handleInputChange("voter_id", e.target.value)}
//             />
//             <Input
//               id="aadhar_number"
//               placeholder="Aadhar Number (12 digits)"
//               value={formData.aadhar_number}
//               onChange={(e) => handleInputChange("aadhar_number", e.target.value)}
//             />
//             <div className="space-y-2">
//               <Label htmlFor="image">Profile Photo</Label>
//               <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
//               {imagePreview && (
//                 <div className="w-20 h-20 border rounded overflow-hidden">
//                   <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Actions */}
//         <div className="flex justify-end space-x-4 pt-6">
//           <Button type="button" onClick={onBack} variant="outline">
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isLoading}>
//             {isLoading ? "Adding..." : <><Save className="w-4 h-4 mr-2" /> Add Member</>}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
// import { useState, useEffect, useMemo } from "react";
// import { UserPlus, Save, ArrowLeft, Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { apiService, Member } from "@/services/api";
// import { useToast } from "@/hooks/use-toast";

// interface AddMemberFormProps {
//   onBack: () => void;
//   onMemberAdded: () => void;
// }

// interface Position {
//   dcode: string;
//   dname: string;
//   tcode: string;
//   tname: string;
//   jcode: string;
//   jname: string;
// }

// export function AddMemberForm({ onBack, onMemberAdded }: AddMemberFormProps) {
//   const [formData, setFormData] = useState<Member>({
//     mobile: "",
//     name: "",
//     parents_name: "",
//     address: "",
//     education_qualification: "",
//     caste: "",
//     joining_date: "",
//     joining_details: "",
//     party_member_number: "",
//     voter_id: "",
//     aadhar_number: "",
//     image: "",
//     jname: "",
//     tname: "",
//     dname: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>("");
//   const [positions, setPositions] = useState<Position[]>([]);
//   const { toast } = useToast();

//   // const BASE_URL = "http://localhost:5253/"; // Update this with your backend URL

//   useEffect(() => {
//     (async () => {
//       try {
//         const [positionsData] = await Promise.all([
//           apiService.getPositions(),
//         ]);
//         // setMembers(Array.isArray(membersData) ? membersData : []);
//         setPositions(Array.isArray(positionsData) ? positionsData.flat() : []);
//         console.log(positionsData)
//       } catch (err) {
//         toast({
//           title: "Error",
//           description: "Failed to fetch data",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//   }, [toast]);

//   /** === Unique Values for Filters === */
//   const unions = useMemo(
//     () => [...new Set(positions.map((p) => p.dname))],
//     [positions]
//   );
//   const teams = useMemo(
//     () =>
//       [
//         ...new Set(
//           positions
//             .filter(
//               (p) => filters.union === "all" || p.dname === filters.union
//             )
//             .map((p) => p.tname)
//         ),
//       ],
//     [positions, filters.union]
//   );
//   const jobs = useMemo(
//     () =>
//       [
//         ...new Set(
//           positions
//             .filter(
//               (p) =>
//                 (filters.union === "all" || p.dname === filters.union) &&
//                 (filters.team === "all" || p.tname === filters.team)
//             )
//             .map((p) => p.jname)
//         ),
//       ],
//     [positions, filters.union, filters.team]
//   );


//   const handleInputChange = (field: keyof FormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const result = reader.result as string;
//         setImagePreview(result);
//         setFormData((prev) => ({ ...prev, image: result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateForm = () => {
//     const required = ["mobile", "name", "parents_name", "address", "party_member_number", "position"];
//     const missing = required.filter((field) => !formData[field as keyof FormData]);

//     if (missing.length > 0) {
//       toast({
//         title: "Validation Error",
//         description: `Please fill in: ${missing.join(", ")}`,
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
//       toast({
//         title: "Validation Error",
//         description: "Please enter a valid 10-digit mobile number",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (formData.aadhar_number && !/^\d{4}-\d{4}-\d{4}$/.test(formData.aadhar_number)) {
//       toast({
//         title: "Validation Error",
//         description: "Aadhar number should be in format: 1234-5678-9012",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       const memberData: Omit<Member, "id"> = {
//         name: formData.name,
//         mobile: formData.mobile,
//         parents_name: formData.parents_name,
//         address: formData.address,
//         party_member_number: formData.party_member_number,
//         joining_date: new Date().toISOString(),
//         caste: formData.caste,
//         education_qualification: formData.education_qualification,
//         joining_details: formData.joining_details,
//         voter_id: formData.voter_id,
//         aadhar_number: formData.aadhar_number,
//         image: formData.image,
//         dname: formData.dname,
//         tname: formData.tname,
//         jname: formData.jname,
//       };
//       await apiService.registerMember(memberData);
//       toast({
//         title: "Success",
//         description: "Member added successfully!",
//       });
//       onMemberAdded();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add member. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Button onClick={onBack} variant="outline" size="sm">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
//             <UserPlus className="w-8 h-8 text-primary" />
//             <span>Add New Member</span>
//           </h1>
//           <p className="text-muted-foreground">Add a new member to the AIADMK party</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Personal Information */}
//         <Card className="card-gradient animate-fade-in">
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//             <CardDescription>Basic member details and contact information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full Name *</Label>
//                 <Input
//                   id="name"
//                   placeholder="Enter full name"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange(formData, 'mobile', e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="parents_name">Father's/Mother's Name *</Label>
//                 <Input
//                   id="parents_name"
//                   placeholder="Enter parent's name"
//                   value={formData.parents_name}
//                   onChange={(e) => handleInputChange("parents_name", e.target.value)}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="mobile">Mobile Number *</Label>
//                 <Input
//                   id="mobile"
//                   type="tel"
//                   placeholder="9876543210"
//                   value={formData.mobile}
//                   onChange={(e) => handleInputChange("mobile", e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="caste">Caste</Label>
//                 <Input
//                   id="caste"
//                   placeholder="Enter caste"
//                   value={formData.caste || ""}
//                   onChange={(e) => handleInputChange("caste", e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="address">Address *</Label>
//               <Textarea
//                 id="address"
//                 placeholder="Enter complete address"
//                 value={formData.address}
//                 onChange={(e) => handleInputChange("address", e.target.value)}
//                 required
//                 rows={3}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="education_qualification">Education Qualification</Label>
//               <Input
//                 id="education_qualification"
//                 placeholder="e.g., B.A., M.A., B.E., etc."
//                 value={formData.education_qualification || ""}
//                 onChange={(e) => handleInputChange("education_qualification", e.target.value)}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Party Information */}
//         <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.2s" }}>
//           <CardHeader>
//             <CardTitle>Party Information</CardTitle>
//             <CardDescription>Party membership and position details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="party_member_number">Party Member Number *</Label>
//                 <Input
//                   id="party_member_number"
//                   placeholder="ADMK001"
//                   value={formData.party_member_number}
//                   onChange={(e) => handleInputChange("party_member_number", e.target.value)}
//                   required
//                 />
//               </div>
//               {/* Union */}
//               <div>
//                 <label className="text-sm font-medium">Union</label>
//                 <Select
//                   value={formData.dname || ""}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, dname: value })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select union" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {unions.length > 0 ? (
//                       unions.map((pos, i) => (
//                         <SelectItem key={i} value={pos || "unknown"}>
//                           {pos || "Unknown Union"}
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

//               {/* Team */}
//               <div>
//                 <label className="text-sm font-medium">Team</label>
//                 <Select
//                   value={formData.tname || ""}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, tname: value })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select team" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {teams.length > 0 ? (
//                       teams.map((pos, i) => (
//                         <SelectItem key={i} value={pos || "unknown"}>
//                           {pos || "Unknown Team"}
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

//               {/* Position */}
//               <div>
//                 <label className="text-sm font-medium">Position</label>
//                 <Select
//                   value={formData.jname || ""}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, jname: value })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select position" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {jobs.length > 0 ? (
//                       jobs.map((pos, i) => (
//                         <SelectItem key={i} value={pos || "unknown"}>
//                           {pos || "Unknown Position"}
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
//             </div>


//             <div className="space-y-2">
//               <Label htmlFor="joining_details">Joining Details</Label>
//               <Textarea
//                 id="joining_details"
//                 placeholder="When and how did they join the party?"
//                 value={formData.joining_details || ""}
//                 onChange={(e) => handleInputChange("joining_details", e.target.value)}
//                 rows={2}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Official Documents */}
//         <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.4s" }}>
//           <CardHeader>
//             <CardTitle>Official Documents</CardTitle>
//             <CardDescription>Government ID and verification details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="voter_id">Voter ID</Label>
//                 <Input
//                   id="voter_id"
//                   placeholder="TN1234567890"
//                   value={formData.voter_id || ""}
//                   onChange={(e) => handleInputChange("voter_id", e.target.value)}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="aadhar_number">Aadhar Number</Label>
//                 <Input
//                   id="aadhar_number"
//                   placeholder="1234-5678-9012"
//                   value={formData.aadhar_number || ""}
//                   onChange={(e) => handleInputChange("aadhar_number", e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Image Upload */}
//             <div className="space-y-2">
//               <Label htmlFor="image">Profile Photo</Label>
//               <div className="flex items-center space-x-4">
//                 <div className="flex-1">
//                   <Input
//                     id="image"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="cursor-pointer"
//                   />
//                 </div>
//                 {imagePreview && (
//                   <div className="w-16 h-16 border-2 border-border rounded-lg overflow-hidden">
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Submit Button */}
//         <div className="flex justify-end space-x-4 pt-6">
//           <Button type="button" onClick={onBack} variant="outline">
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isLoading} className="btn-hero min-w-[150px]">
//             {isLoading ? (
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
//                 <span>Adding...</span>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-2">
//                 <Save className="w-4 h-4" />
//                 <span>Add Member</span>
//               </div>
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { UserPlus, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddMemberFormProps {
  onBack: () => void;
  onMemberAdded: () => void;
}

interface Position {
  dcode: string;
  dname: string;
  tcode: string;
  tname: string;
  jcode: string;
  jname: string;
}

// ✅ Define correct form data type
interface MemberFormData {
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
  image: File | null;
  dname: string;
  tname: string;
  jname: string;
}

export function AddMemberForm({ onBack, onMemberAdded }: AddMemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    mobile: "",
    name: "",
    date_of_birth: "",
    parents_name: "",
    address: "",
    education_qualification: "",
    caste: "",
    joining_date: "",
    joining_details: "",
    party_member_number: "",
    voter_id: "",
    aadhar_number: "",
    image: null,
    dname: "",
    tname: "",
    jname: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [positions, setPositions] = useState<Position[]>([]);
  const { toast } = useToast();

  // Filters state
  const [filters, setFilters] = useState({
    union: "all",
    team: "all",
  });

  // Fetch positions
  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getPositions();
        setPositions(Array.isArray(data) ? data.flat() : []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch positions",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  // Unique dropdown values
  const unions = useMemo(
    () => [...new Set(positions.map((p) => p.dname))],
    [positions]
  );
  const teams = useMemo(
    () =>
      [
        ...new Set(
          positions
            .filter((p) => filters.union === "all" || p.dname === filters.union)
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

  // Input change handler
  const handleInputChange = (field: keyof MemberFormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Validate form
  const validateForm = () => {
    const required = ["mobile", "name", "parents_name", "address", "party_member_number"];
    const missing = required.filter((f) => !formData[f as keyof MemberFormData]);

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          if (value instanceof File) {
            data.append(key, value);
          } else {
            data.append(key, value as string);
          }
        }
      });

      console.log(data)
      await apiService.registerMember(data);

      toast({
        title: "Success",
        description: "Member added successfully!",
      });

      onMemberAdded();
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  placeholder="June 01, 2025"
                  className="bg-background pr-10"
                  onChange={(e) =>
                    handleInputChange('date_of_birth', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="XXXXXXXXXX"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
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
                  placeholder="AIADMK001"
                  value={formData.party_member_number}
                  onChange={(e) => handleInputChange('party_member_number', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Union *</Label>
                <Select value={formData.dname} onValueChange={(value) => handleInputChange('dname', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
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
              <div className="space-y-2">
                <Label htmlFor="position">Team *</Label>
                <Select value={formData.tname} onValueChange={(value) => handleInputChange('tname', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
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
                        No Union available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select value={formData.jname} onValueChange={(value) => handleInputChange('jname', value)}>
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
                        No Union available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Joining Date</label>
              <Input
                type="date"
                value={formData.joining_date.split("T")[0]}
                placeholder="June 01, 2025"
                className="bg-background pr-10"
                onChange={(e) =>
                  handleInputChange('joining_date', e.target.value)
                }
              />
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
