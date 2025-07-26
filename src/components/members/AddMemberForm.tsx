import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

interface AddMemberFormProps {
  newMember: {
    name: string;
    age: string;
    gender: string;
    relation: string;
    mobile_number: string;
  };
  onMemberChange: (member: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AddMemberForm = ({ newMember, onMemberChange, onSave, onCancel }: AddMemberFormProps) => {
  return (
    <Card className="p-4 border-dashed">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newMember.name}
              onChange={(e) => onMemberChange({...newMember, name: e.target.value})}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              value={newMember.age}
              onChange={(e) => onMemberChange({...newMember, age: e.target.value})}
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
              onChange={(e) => onMemberChange({...newMember, gender: e.target.value})}
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
              onChange={(e) => onMemberChange({...newMember, relation: e.target.value})}
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
            onChange={(e) => onMemberChange({...newMember, mobile_number: e.target.value})}
            placeholder="Enter mobile number"
            type="tel"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onCancel}
            size="sm"
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave} size="sm" className="bg-gradient-medical">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
};
