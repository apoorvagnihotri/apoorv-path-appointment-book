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

interface EditMemberFormProps {
  editingMember: Member;
  onMemberChange: (member: Member) => void;
  onUpdate: () => void;
  onCancel: () => void;
  onRemove: (id: string) => void;
}

export const EditMemberForm = ({ editingMember, onMemberChange, onUpdate, onCancel, onRemove }: EditMemberFormProps) => {
  return (
    <Card className="p-4 border-dashed">
      <div className="space-y-4">
        <h3 className="font-semibold">Edit Member Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={editingMember.name}
              onChange={(e) => onMemberChange({...editingMember, name: e.target.value})}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label htmlFor="edit-age">Age</Label>
            <Input
              id="edit-age"
              value={editingMember.age}
              onChange={(e) => onMemberChange({...editingMember, age: e.target.value})}
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
              onChange={(e) => onMemberChange({...editingMember, gender: e.target.value})}
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
              onChange={(e) => onMemberChange({...editingMember, relation: e.target.value})}
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
            onChange={(e) => onMemberChange({...editingMember, mobile_number: e.target.value})}
            placeholder="Enter mobile number"
            type="tel"
          />
        </div>
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onUpdate} size="sm" className="bg-gradient-medical">
              <Save className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>
          {editingMember.id !== "self" && (
            <Button
              onClick={() => {
                onRemove(editingMember.id);
                onCancel();
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
  );
};
