import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMemberManagement } from "@/hooks/useMemberManagement";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

const ManageMembers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { members, loading, addMember, updateMember, removeMember } = useMemberManagement();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    relation: '',
    mobile_number: ''
  });

  // Handle user authentication check
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      relation: '',
      mobile_number: ''
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (member: Member) => {
    if (member.id === "self") {
      toast({
        title: "Info",
        description: "Self information can be updated in profile settings",
        variant: "default"
      });
      return;
    }
    
    setFormData({
      name: member.name,
      age: member.age,
      gender: member.gender,
      relation: member.relation,
      mobile_number: member.mobile_number || ''
    });
    setEditingMember(member);
    setShowForm(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.age || !formData.relation) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate age
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid age between 1 and 120",
        variant: "destructive",
      });
      return;
    }

    // Validate mobile number if provided
    if (formData.mobile_number && formData.mobile_number.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    let success = false;
    if (editingMember) {
      const updatedMember = { ...editingMember, ...formData };
      success = await updateMember(updatedMember);
    } else {
      success = await addMember(formData);
    }
    
    if (success) {
      toast({
        title: "Success",
        description: editingMember ? "Member updated successfully!" : "Member added successfully!",
      });
      resetForm();
    }
  };

  const handleDelete = async (memberId: string) => {
    if (memberId === "self") {
      toast({
        title: "Error",
        description: "Cannot delete self information",
        variant: "destructive"
      });
      return;
    }
    
    await removeMember(memberId);
  };

  // Filter out "self" from the display list as it should be managed in profile
  const displayMembers = members.filter(member => member.id !== "self");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold ml-8">Manage Family Members</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Add New Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAddNew}
            className="bg-gradient-medical text-white hover:shadow-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Family Member
          </Button>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading members...</p>
          ) : displayMembers.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No family members added</h3>
              <p className="text-muted-foreground mb-4">Add your family members to book tests for them</p>
              <Button onClick={handleAddNew} className="bg-gradient-medical">
                <Plus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </Card>
          ) : (
            displayMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {member.relation}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Age: {member.age} years • Gender: {member.gender}
                      </p>
                      {member.mobile_number && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {member.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {member.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input 
                      id="age" 
                      type="number"
                      placeholder="Enter age"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="relation">Relation *</Label>
                  <Select value={formData.relation} onValueChange={(value) => handleInputChange('relation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Grandfather">Grandfather</SelectItem>
                      <SelectItem value="Grandmother">Grandmother</SelectItem>
                      <SelectItem value="Uncle">Uncle</SelectItem>
                      <SelectItem value="Aunt">Aunt</SelectItem>
                      <SelectItem value="Cousin">Cousin</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number (Optional)</Label>
                  <Input 
                    id="mobile" 
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.mobile_number}
                    onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-medical hover:shadow-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageMembers;
