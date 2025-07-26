import { useState, useEffect } from "react";
import { ChevronLeft, Plus, User, Edit, X, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderProgress } from "@/components/ui/order-progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

const Members = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items: cartItems } = useCart();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [memberTestSelections, setMemberTestSelections] = useState<{[memberId: string]: {[itemId: string]: boolean}}>({});
  const [newMember, setNewMember] = useState({
    name: "",
    age: "",
    gender: "Male",
    relation: "",
    mobile_number: ""
  });

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
        relation: member.relation,
        mobile_number: member.mobile_number
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

  // Initialize member test selections when members or cart changes
  useEffect(() => {
    if (selectedMembers.length > 0 && cartItems.length > 0) {
      const newSelections: {[memberId: string]: {[itemId: string]: boolean}} = {};
      selectedMembers.forEach(memberId => {
        newSelections[memberId] = {};
        cartItems.forEach(item => {
          const itemId = item.test_id || item.package_id || item.service_id || '';
          newSelections[memberId][itemId] = true; // All items selected by default
        });
      });
      setMemberTestSelections(newSelections);
    }
  }, [selectedMembers, cartItems]);

  const handleTestSelectionForMember = (memberId: string, itemId: string, checked: boolean) => {
    setMemberTestSelections(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [itemId]: checked
      }
    }));
  };

  const handleProceedToTestSelection = () => {
    if (selectedMembers.length > 1) {
      setShowTestSelection(true);
    } else {
      navigate('/schedule');
    }
  };

  const handleFinalProceed = () => {
    // Store the member test selections in localStorage or context for use in next steps
    localStorage.setItem('memberTestSelections', JSON.stringify(memberTestSelections));
    navigate('/schedule');
  };

  // Handle user authentication check after all hooks
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
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
          relation: newMember.relation,
          mobile_number: newMember.mobile_number
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
        relation: data.relation,
        mobile_number: data.mobile_number
      };

      setMembers([...members, newFamilyMember]);
      setNewMember({ name: "", age: "", gender: "Male", relation: "", mobile_number: "" });
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
          relation: editingMember.relation,
          mobile_number: editingMember.mobile_number
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

  // Add validation function
  const canContinue = selectedMembers.length > 0;

  // Test Selection Subpage Component
  const TestSelectionSubpage = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setShowTestSelection(false)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold ml-8">Select Tests for Members</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Progress Stepper */}
        <OrderProgress currentStep={3} />

        <Card>
          <CardHeader>
            <CardTitle>Customize Tests for Each Member</CardTitle>
            <p className="text-sm text-muted-foreground">
              All tests are selected by default. Uncheck tests that specific members don't need.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedMembers.map((memberId) => {
              const member = members.find(m => m.id === memberId);
              if (!member) return null;

              return (
                <div key={memberId} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.age} years • {member.gender} • {member.relation}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const itemData = item.test || item.package || item.service;
                      const itemId = item.test_id || item.package_id || item.service_id || '';
                      const itemType = item.test ? 'Test' : item.package ? 'Package' : 'Service';
                      
                      if (!itemData) return null;

                      return (
                        <div 
                          key={itemId} 
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            memberTestSelections[memberId]?.[itemId] 
                              ? 'bg-primary/10 border border-primary' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => handleTestSelectionForMember(memberId, itemId, !(memberTestSelections[memberId]?.[itemId] || false))}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={memberTestSelections[memberId]?.[itemId] || false}
                              onCheckedChange={(checked) => 
                                handleTestSelectionForMember(memberId, itemId, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()} // Prevent double triggering
                              className="pointer-events-none" // Disable direct checkbox clicks
                            />
                            <div>
                              <p className="font-medium">{itemData.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {itemType} • ₹{itemData.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleFinalProceed}
            className="w-full h-12 bg-gradient-medical"
            size="lg"
          >
            Book Slots for Selected Tests
          </Button>
        </div>
      </div>
    </div>
  );

  if (showTestSelection) {
    return <TestSelectionSubpage />;
  }

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
            <h1 className="text-2xl font-semibold ml-8">Family</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Progress Stepper */}
        <OrderProgress currentStep={3} />

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Select Members</CardTitle>
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
            {!loading && selectedMembers.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Please select at least one member to continue
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading members...</p>
              ) : (
                <>
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMembers.includes(member.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMemberSelection(member.id, !selectedMembers.includes(member.id))}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()} // Prevent double triggering
                          className="pointer-events-none" // Disable direct checkbox clicks
                        />
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                         <div>
                           <p className="font-semibold text-foreground">{member.name}</p>
                           <p className="text-sm text-muted-foreground">
                             {member.age} years • {member.gender} • {member.relation}
                           </p>
                           {member.mobile_number && (
                             <p className="text-sm text-muted-foreground">
                               📱 {member.mobile_number}
                             </p>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Button 
                           size="sm" 
                           variant="ghost"
                           onClick={(e) => {
                             e.stopPropagation(); // Prevent card selection when clicking edit
                             handleEditMember(member);
                           }}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
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
                  <div>
                    <Label htmlFor="mobile">Mobile Number - We will send test reports here</Label>
                    <Input
                      id="mobile"
                      value={newMember.mobile_number}
                      onChange={(e) => setNewMember({...newMember, mobile_number: e.target.value})}
                      placeholder="Enter mobile number"
                      type="tel"
                    />
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
                  <div>
                    <Label htmlFor="edit-mobile">Mobile Number - We will send test reports here</Label>
                    <Input
                      id="edit-mobile"
                      value={editingMember.mobile_number || ""}
                      onChange={(e) => setEditingMember({...editingMember, mobile_number: e.target.value})}
                      placeholder="Enter mobile number"
                      type="tel"
                    />
                  </div>
                  <div className="flex justify-between">
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
                    {editingMember.id !== "self" && (
                      <Button
                        onClick={() => {
                          handleRemoveMember(editingMember.id);
                          setEditingMember(null);
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleProceedToTestSelection}
            disabled={!canContinue}
            className={`w-full h-12 ${canContinue ? 'bg-gradient-medical' : 'bg-gray-300 cursor-not-allowed'}`}
            size="lg"
          >
            {canContinue ? 
              (selectedMembers.length > 1 ? 
                <>
                  Select Tests for Members <ArrowRight className="h-4 w-4 ml-2" />
                </> : 
                'Book a slot'
              ) : 
              `Select ${selectedMembers.length === 0 ? 'at least one' : 'a'} member to continue`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Members;