import { useBookingAssignment } from '@/hooks/useBookingAssignment';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Clock,
  Tag,
  Package,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function AssignBooking() {
  const { token } = useParams();
  const {
    assignment,
    technicians,
    loading,
    error,
    assignedBy,
    setAssignedBy,
    selectedTechnician,
    setSelectedTechnician,
    isSubmitting,
    assignmentSuccess,
    handleAssignTechnician,
  } = useBookingAssignment();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (assignmentSuccess) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="font-bold text-green-800">
            Assignment Successful!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            The booking has been successfully assigned. You can now close this page
            or view the dashboard.
          </AlertDescription>
          <div className="mt-4">
            <Link to="/booking-dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Assignment Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assignment) {
    return null; // Should be covered by loading/error states
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Assign Technician to Booking
          </CardTitle>
          <CardDescription>
            Assign a lab technician to order #{assignment.orders.order_number}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAssignTechnician}>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
              <div className="flex items-center text-sm text-gray-700">
                <Tag className="w-4 h-4 mr-2" />
                <strong>Order:</strong>&nbsp;#{assignment.orders.order_number}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <strong>Customer:</strong>&nbsp;{assignment.orders.customer_name}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <strong>Date:</strong>&nbsp;
                {assignment.orders.appointment_date || 'Not set'}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2" />
                <strong>Time:</strong>&nbsp;
                {assignment.orders.appointment_time || 'Not set'}
              </div>
              <div className="flex items-center text-lg font-bold text-primary mt-2">
                <Package className="w-5 h-5 mr-2" />
                <strong>Total:</strong>&nbsp;₹{assignment.orders.total_amount}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="technician" className="font-semibold">
                Select Technician
              </label>
              <Select
                onValueChange={setSelectedTechnician}
                value={selectedTechnician}
              >
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="assignedBy" className="font-semibold">
                Your Name (Assigner)
              </label>
              <Input
                id="assignedBy"
                placeholder="Enter your full name"
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
