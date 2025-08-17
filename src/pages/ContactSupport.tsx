import React from 'react';
import { ArrowLeft, Phone, Mail, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

const ContactSupport = () => {
  const navigate = useNavigate();

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:apoorvpath@gmail.com';
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-foreground hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold">Contact Support</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-16 pb-20 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Get Help</h2>
          <p className="text-muted-foreground">Choose how you'd like to contact our support team</p>
        </div>

        <div className="space-y-4">
          {/* Lab Contact */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={() => handlePhoneCall('9993522579')}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-slate-100 hover:bg-slate-200 text-foreground border border-slate-200"
              >
                <Building2 className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Lab Contact</div>
                  <div className="text-sm opacity-70">9993522579</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Technician 1 */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={() => handlePhoneCall('7610259348')}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-emerald-50 hover:bg-emerald-100 text-foreground border border-emerald-200"
              >
                <User className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Technician 1</div>
                  <div className="text-sm opacity-70">7610259348</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Technician 2 */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={() => handlePhoneCall('8770276578')}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-indigo-50 hover:bg-indigo-100 text-foreground border border-indigo-200"
              >
                <User className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Technician 2</div>
                  <div className="text-sm opacity-70">8770276578</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={handleEmailSupport}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-amber-50 hover:bg-amber-100 text-foreground border border-amber-200"
              >
                <Mail className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Email Support</div>
                  <div className="text-sm opacity-70">apoorvpath@gmail.com</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Support Hours</h3>
            <p className="text-blue-800 text-sm mb-3">
              Working Hours: 6:00 AM – 10:00 PM (Every Day)
            </p>
            <p className="text-blue-800 text-sm">
              Lab Address: O-13, Sneh Nagar, Jabalpur, MP
            </p>
          </CardContent>
        </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ContactSupport;