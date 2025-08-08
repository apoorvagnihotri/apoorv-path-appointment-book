import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderProgress } from "@/components/ui/order-progress";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useMemberManagement } from "@/hooks/useMemberManagement";
import { MemberCard } from "@/components/members/MemberCard";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { EditMemberForm } from "@/components/members/EditMemberForm";
import { TestSelectionSubpage } from "@/components/members/TestSelectionSubpage";

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
  
  // Read collection type from session storage to control flow
  const collectionType = sessionStorage.getItem('collectionType') || 'home';
  
  // Remove any potential duplicate cart items using useMemo to prevent recalculation
  const uniqueCartItems = useMemo(() => 
    cartItems.filter((item, index, array) => 
      array.findIndex(i => i.id === item.id) === index
    ), [cartItems]
  );
  
  const { members, loading, addMember, updateMember, removeMember } = useMemberManagement();
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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

  // Handle user authentication check
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleMemberSelection = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    }
  };

  // Initialize member test selections when members or cart changes
  useEffect(() => {
    if (selectedMembers.length > 0 && uniqueCartItems.length > 0) {
      setMemberTestSelections(prev => {
        // Only create new selections if we don't already have selections for these members
        const needsUpdate = selectedMembers.some(memberId => !prev[memberId]);
        
        if (needsUpdate) {
          const newSelections: {[memberId: string]: {[itemId: string]: boolean}} = { ...prev };
          selectedMembers.forEach(memberId => {
            if (!newSelections[memberId]) {
              newSelections[memberId] = {};
              uniqueCartItems.forEach(item => {
                const itemId = item.test_id || item.package_id || item.service_id || '';
                newSelections[memberId][itemId] = false; // All items unselected by default
              });
            }
          });
          return newSelections;
        }
        return prev;
      });
    }
  }, [selectedMembers, uniqueCartItems]);

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
      const ct = sessionStorage.getItem('collectionType') || 'home';
      navigate(ct === 'lab' ? '/payment' : '/schedule');
    }
  };

  const handleFinalProceed = () => {
    // Store the member test selections and selected members in sessionStorage for use in next steps
    sessionStorage.setItem('memberTestSelections', JSON.stringify(memberTestSelections));
    sessionStorage.setItem('selectedMembers', JSON.stringify(selectedMembers));
    
    // Store member details for display
    const selectedMemberDetails = selectedMembers.map(memberId => 
      members.find(m => m.id === memberId)
    ).filter(Boolean);
    sessionStorage.setItem('selectedMemberDetails', JSON.stringify(selectedMemberDetails));
    
    const ct = sessionStorage.getItem('collectionType') || 'home';
    navigate(ct === 'lab' ? '/payment' : '/schedule');
  };

  // Check if at least one test is selected for at least one member
  const hasSelectedTests = () => {
    return Object.values(memberTestSelections).some(memberSelections => 
      Object.values(memberSelections).some(isSelected => isSelected)
    );
  };

  const handleAddMember = async () => {
    const success = await addMember(newMember);
    if (success) {
      setNewMember({ name: "", age: "", gender: "Male", relation: "", mobile_number: "" });
      setShowAddForm(false);
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
    if (!editingMember) return;
    
    const success = await updateMember(editingMember);
    if (success) {
      setEditingMember(null);
    }
  };

  const handleRemoveMember = async (id: string) => {
    await removeMember(id);
  };

  // Add validation function
  const canContinue = selectedMembers.length > 0;

  if (showTestSelection) {
    return (
      <TestSelectionSubpage
        selectedMembers={selectedMembers}
        members={members}
        cartItems={uniqueCartItems}
        memberTestSelections={memberTestSelections}
        onBack={() => setShowTestSelection(false)}
        onTestSelectionChange={handleTestSelectionForMember}
        onFinalProceed={handleFinalProceed}
        hasSelectedTests={hasSelectedTests}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
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

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
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
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading members...</p>
                ) : (
                  <>
                    {members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        isSelected={selectedMembers.includes(member.id)}
                        onSelect={handleMemberSelection}
                        onEdit={handleEditMember}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Add Member Form */}
              {showAddForm && (
                <AddMemberForm
                  newMember={newMember}
                  onMemberChange={setNewMember}
                  onSave={handleAddMember}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {/* Edit Member Form */}
              {editingMember && (
                <EditMemberForm
                  editingMember={editingMember}
                  onMemberChange={setEditingMember}
                  onUpdate={handleUpdateMember}
                  onCancel={() => setEditingMember(null)}
                  onRemove={handleRemoveMember}
                />
              )}
            </CardContent>
          </Card>

          {/* Warning message */}
          {!loading && selectedMembers.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Please select at least one member to continue
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Continue Button positioned above BottomNavigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
        <div className="px-6 py-4">
          <Button
            onClick={handleProceedToTestSelection}
            disabled={!canContinue}
            className={`w-full min-h-[3rem] ${canContinue ? 'bg-gradient-medical' : 'bg-gray-300 cursor-not-allowed'}`}
            size="lg"
          >
            {canContinue ? 
              (selectedMembers.length > 1 ? 
                <>
                  Select Tests for Members <ArrowRight className="h-4 w-4 ml-2" />
                </> : 
                (collectionType === 'lab' ? 'Proceed to Payment' : 'Book a slot')
              ) : 
              `Select ${selectedMembers.length === 0 ? 'at least one' : 'a'} member to continue`
            }
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Members;