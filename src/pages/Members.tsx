import { useState, useEffect } from "react";
import { ChevronLeft, Plus, User, Edit, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
}

const Members = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    age: "",
    gender: "Male",
    relation: ""
  });

  const orderSteps = [
    { id: 1, title: "Select", description: "Choose tests" },
    { id: 2, title: "Members", description: "Add members" },
    { id: 3, title: "Schedule", description: "Date & time" },
    { id: 4, title: "Payment", description: "Complete order" }
  ];

  // Define loadMembers function before useEffect
  const loadMembers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Add self as the first member
      const selfMember: Member = {
        id: "self",
        name: user.user_metadata?.full_name || "You",
        age: "25",
        gender: "Male",
        relation: "Self"
      };

      // Fetch family members from database
      const { data: familyMembers, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading family members:', error);
        toast({
          title: "Error",
          description: "Failed to load family members",
          variant: "destructive"
        });
        setMembers([selfMember]);
        return;
      }

      const dbMembers: Member[] = familyMembers?.map(member => ({
        id: member.id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        relation: member.relation
      })) || [];

      setMembers([selfMember, ...dbMembers]);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load family members from database
  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  const handleMemberSelection = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    }
  };

  // Handle user authentication check AFTER all hooks
  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleAddMember = async () => {
    if (!user || !newMember.name || !newMember.age || !newMember.relation) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name: newMember.name,
          age: newMember.age,
          gender: newMember.gender,
          relation: newMember.relation
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding family member:', error);
        toast({
          title: "Error",
          description: "Failed to add family member",
          variant: "destructive"
        });
        return;
      }

      // Add to local state
      const newFamilyMember: Member = {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        relation: data.relation
      };

      setMembers([...members, newFamilyMember]);
      setNewMember({ name: "", age: "", gender: "Male", relation: "" });
      setShowAddForm(false);
      
      toast({
        title: "Success",
        description: "Family member added successfully"
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add family member",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (id === "self") {
      toast({
        title: "Error",
        description: "Cannot remove yourself",
        variant: "destructive"
      });
      return;
    }

    if (members.length <= 1) return;

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error removing family member:', error);
        toast({
          title: "Error",
          description: "Failed to remove family member",
          variant: "destructive"
        });
        return;
      }

      setMembers(members.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Family member removed successfully"
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove family member",
        variant: "destructive"
      });
    }
  };

  const handleEditMember = (member: Member) => {
    if (member.id === "self") {
      toast({
        title: "Info",
        description: "Self information can be updated in profile settings",
        variant: "default"
      });
      return;
    }
    setEditingMember(member);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !editingMember.name || !editingMember.age || !editingMember.relation) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          name: editingMember.name,
          age: editingMember.age,
          gender: editingMember.gender,
          relation: editingMember.relation
        })
        .eq('id', editingMember.id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating family member:', error);
        toast({
          title: "Error",
          description: "Failed to update family member",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
      setEditingMember(null);
      
      toast({
        title: "Success",
        description: "Family member updated successfully"
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update family member",
        variant: "destructive"
      });
    }
  };

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
            <h1 className="text-2xl font-semibold ml-8">Select Members for Sample Collection</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Progress Stepper */}
        <Card className="p-4">
          <ProgressStepper steps={orderSteps} currentStep={2} />
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Family Members</CardTitle>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-medical text-white hover:shadow-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading members...</p>
              ) : (
                <>
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.age} years • {member.gender} • {member.relation}
                          </p>
                        </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Button 
                           size="sm" 
                           variant="ghost"
                           onClick={() => handleEditMember(member)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Checkbox
                           checked={selectedMembers.includes(member.id)}
                           onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                         />
                       </div>
                     </div>
                  ))}
                </>
              )}
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <Card className="p-4 border-dashed">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={newMember.age}
                        onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                        placeholder="Enter age"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={newMember.gender}
                        onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="relation">Relation</Label>
                      <select
                        id="relation"
                        value={newMember.relation}
                        onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="">Select relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Father-in-law">Father-in-law</option>
                        <option value="Mother-in-law">Mother-in-law</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember} size="sm" className="bg-gradient-medical">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Edit Member Form */}
            {editingMember && (
              <Card className="p-4 border-dashed">
                <div className="space-y-4">
                  <h3 className="font-semibold">Edit Member Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-age">Age</Label>
                      <Input
                        id="edit-age"
                        value={editingMember.age}
                        onChange={(e) => setEditingMember({...editingMember, age: e.target.value})}
                        placeholder="Enter age"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-gender">Gender</Label>
                      <select
                        id="edit-gender"
                        value={editingMember.gender}
                        onChange={(e) => setEditingMember({...editingMember, gender: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-relation">Relation</Label>
                      <select
                        id="edit-relation"
                        value={editingMember.relation}
                        onChange={(e) => setEditingMember({...editingMember, relation: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="">Select relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Father-in-law">Father-in-law</option>
                        <option value="Mother-in-law">Mother-in-law</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setEditingMember(null)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateMember} size="sm" className="bg-gradient-medical">
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={() => navigate('/schedule')}
            className="w-full h-12 bg-gradient-medical"
            size="lg"
          >
            Continue to Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Members;