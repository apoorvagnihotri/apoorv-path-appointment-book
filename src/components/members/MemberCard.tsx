import { User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onSelect: (memberId: string, checked: boolean) => void;
  onEdit: (member: Member) => void;
}

export const MemberCard = ({ member, isSelected, onSelect, onEdit }: MemberCardProps) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(member.id, !isSelected)}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(member.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
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
            e.stopPropagation();
            onEdit(member);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
