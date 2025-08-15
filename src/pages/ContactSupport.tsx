import React from 'react';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ContactSupport = () => {
  const navigate = useNavigate();

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:apoorvpath@gmail.com';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
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

      {/* Content */}
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
                className="w-full flex items-center justify-start space-x-4 h-16 bg-blue-400 hover:bg-blue-500 text-white"
              >
                <Phone className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Lab Contact</div>
                  <div className="text-sm opacity-90">9993522579</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Technician 1 */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={() => handlePhoneCall('7610259348')}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-emerald-400 hover:bg-emerald-500 text-white"
              >
                <Phone className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Technician 1</div>
                  <div className="text-sm opacity-90">7610259348</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Technician 2 */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={() => handlePhoneCall('8770276578')}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-violet-400 hover:bg-violet-500 text-white"
              >
                <Phone className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Technician 2</div>
                  <div className="text-sm opacity-90">8770276578</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <Button
                onClick={handleEmailSupport}
                className="w-full flex items-center justify-start space-x-4 h-16 bg-amber-400 hover:bg-amber-500 text-white"
              >
                <Mail className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-base">Email Support</div>
                  <div className="text-sm opacity-90">apoorvpath@gmail.com</div>
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
  );
};

export default ContactSupport;