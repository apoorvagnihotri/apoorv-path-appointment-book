import { ChevronLeft, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderProgress } from "@/components/ui/order-progress";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
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
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
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

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
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
                    
                    <div className="space-y-3 pl-12">
                      {cartItems.map((item) => {
                        const itemData = item.test || item.package || item.service;
                        const itemId = item.test_id || item.package_id || item.service_id || '';
                        const itemType = item.test ? 'Test' : item.package ? 'Package' : 'Service';
                        
                        if (!itemData) return null;

                        return (
                          <div
                            key={itemId}
                            className={`flex items-center justify-start p-3 rounded-lg cursor-pointer shadow-card transition-colors ${
                              itemType === 'Test'
                                ? 'bg-gradient-to-r from-red-50 to-white border border-red-200'
                                : itemType === 'Package'
                                ? 'bg-gradient-to-r from-blue-50 to-white border border-blue-200'
                                : 'bg-gradient-to-r from-green-50 to-white border border-green-200'
                            } ${
                              memberTestSelections[memberId]?.[itemId]
                                ? 'ring-2 ring-primary'
                                : 'hover:opacity-95'
                            }`}
                            onClick={() => onTestSelectionChange(memberId, itemId, !(memberTestSelections[memberId]?.[itemId] || false))}
                          >
                            <div className="flex items-center space-x-3">
                              {memberTestSelections[memberId]?.[itemId] ? (
                                <div className="h-5 w-5 bg-green-500 rounded-sm flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 border border-gray-300 rounded-sm" />
                              )}
                              <div className="text-left">
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
        </div>
      </div>

      {/* Fixed Continue Button positioned above BottomNavigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
        <div className="px-6 py-4">
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
            className={`w-full min-h-[3rem] ${hasSelectedTests() ? 'bg-gradient-medical' : 'bg-gray-300 cursor-not-allowed'}`}
            size="lg"
          >
            {hasSelectedTests() ? 'Book Slot for Selected Tests' : 'Select tests to continue'}
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
