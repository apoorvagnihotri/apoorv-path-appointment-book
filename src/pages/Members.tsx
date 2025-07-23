import { useState } from "react";
import { ArrowLeft, Plus, User, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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
  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: user?.user_metadata?.full_name || "You",
      age: "25",
      gender: "Male",
      relation: "Self"
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.age && newMember.relation) {
      setMembers([...members, {
        id: Date.now().toString(),
        ...newMember
      }]);
      setNewMember({ name: "", age: "", gender: "Male", relation: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate(-1)}
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Select Members</h1>
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
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {members.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}

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
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
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