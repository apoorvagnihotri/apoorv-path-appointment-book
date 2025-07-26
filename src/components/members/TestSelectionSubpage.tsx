import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderProgress } from "@/components/ui/order-progress";
import { Separator } from "@/components/ui/separator";

interface Member {
  id: string;
  name: string;
  age: string;
  gender: string;
  relation: string;
  mobile_number?: string;
}

interface CartItem {
  id: string;
  test_id?: string;
  package_id?: string;
  service_id?: string;
  test?: { id: string; name: string; price: number };
  package?: { id: string; name: string; price: number };
  service?: { id: string; name: string; price: number };
}

interface TestSelectionSubpageProps {
  selectedMembers: string[];
  members: Member[];
  cartItems: CartItem[];
  memberTestSelections: {[memberId: string]: {[itemId: string]: boolean}};
  onBack: () => void;
  onTestSelectionChange: (memberId: string, itemId: string, checked: boolean) => void;
  onFinalProceed: () => void;
  hasSelectedTests: () => boolean;
}

export const TestSelectionSubpage = ({
  selectedMembers,
  members,
  cartItems,
  memberTestSelections,
  onBack,
  onTestSelectionChange,
  onFinalProceed,
  hasSelectedTests
}: TestSelectionSubpageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
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
              Select the tests each member needs. Click on test cards to select them.
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
                          className={`flex items-center justify-end p-3 rounded-lg cursor-pointer transition-colors ${
                            memberTestSelections[memberId]?.[itemId] 
                              ? 'bg-primary/10 border border-primary' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => onTestSelectionChange(memberId, itemId, !(memberTestSelections[memberId]?.[itemId] || false))}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-medium">{itemData.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {itemType} • ₹{itemData.price}
                              </p>
                            </div>
                            <Checkbox
                              checked={memberTestSelections[memberId]?.[itemId] || false}
                              onCheckedChange={(checked) => 
                                onTestSelectionChange(memberId, itemId, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="pointer-events-none"
                            />
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
          {!hasSelectedTests() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Please select at least one test for at least one member to continue
              </p>
            </div>
          )}
          <Button
            onClick={onFinalProceed}
            disabled={!hasSelectedTests()}
            className={`w-full h-12 ${hasSelectedTests() ? 'bg-gradient-medical' : 'bg-gray-300 cursor-not-allowed'}`}
            size="lg"
          >
            {hasSelectedTests() ? 'Book Slot for Selected Tests' : 'Select tests to continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
