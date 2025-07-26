import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

export const useMemberManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addMember = async (newMemberData: {
    name: string;
    age: string;
    gender: string;
    relation: string;
    mobile_number: string;
  }) => {
    if (!user || !newMemberData.name || !newMemberData.age || !newMemberData.relation) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name: newMemberData.name,
          age: newMemberData.age,
          gender: newMemberData.gender,
          relation: newMemberData.relation,
          mobile_number: newMemberData.mobile_number
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
        return false;
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
      
      toast({
        title: "Success",
        description: "Family member added successfully"
      });
      return true;
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add family member",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMember = async (editingMember: Member) => {
    if (!editingMember || !editingMember.name || !editingMember.age || !editingMember.relation) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return false;
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
        return false;
      }

      // Update local state
      setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
      
      toast({
        title: "Success",
        description: "Family member updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update family member",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeMember = async (id: string) => {
    if (id === "self") {
      toast({
        title: "Error",
        description: "Cannot remove yourself",
        variant: "destructive"
      });
      return false;
    }

    if (members.length <= 1) return false;

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
        return false;
      }

      setMembers(members.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Family member removed successfully"
      });
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove family member",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load family members from database
  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  return {
    members,
    loading,
    addMember,
    updateMember,
    removeMember,
    loadMembers
  };
};
