import { useState } from 'react';
import { useBookingDashboard, BookingStatus } from '@/hooks/useBookingDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, CheckCircle, User, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';

const statusColors: { [key in BookingStatus | 'completed']: string } = {
  all: 'bg-gray-100 text-gray-800',
  pending: 'bg-red-100 text-red-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

function QuickAssignDialog({ assignmentId, technicians, onAssign }: { assignmentId: string, technicians: any[], onAssign: (techId: string, assigner: string) => Promise<any> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [assignedBy, setAssignedBy] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!selectedTechnician || !assignedBy) {
            toast({ title: "Error", description: "Please select a technician and enter your name.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        const result = await onAssign(selectedTechnician, assignedBy);
        if (result.success) {
            toast({ title: "Success", description: "Technician assigned successfully." });
            setIsOpen(false);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">Assign</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Quick Assign Technician</DialogTitle>
                    <DialogDescription>Select a technician and enter your name to assign this booking.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Select onValueChange={setSelectedTechnician}>
                        <SelectTrigger><SelectValue placeholder="Select a technician..." /></SelectTrigger>
                        <SelectContent>
                            {technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input placeholder="Your Name (Assigner)" value={assignedBy} onChange={e => setAssignedBy(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function BookingDashboard() {
  const {
    bookings,
    technicians,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    assignTechnician,
    completeAssignment,
    refreshData,
  } = useBookingDashboard();
  const { toast } = useToast();

  const handleComplete = async (assignmentId: string) => {
    const result = await completeAssignment(assignmentId);
    if (result.success) {
        toast({ title: "Success", description: "Booking marked as completed." });
    } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Booking Dashboard</h1>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Order # or Customer Name..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.order_info.order_number}</TableCell>
                    <TableCell>{booking.order_info.customer_name}</TableCell>
                    <TableCell>
                        <div className="flex items-center text-sm"><Calendar className="w-3 h-3 mr-1.5" /> {booking.order_info.appointment_date || 'N/A'}</div>
                        <div className="flex items-center text-sm"><Clock className="w-3 h-3 mr-1.5" /> {booking.order_info.appointment_time || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[booking.status as BookingStatus | 'completed']}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                        {booking.technician ? (
                            <div className="flex items-center text-sm"><User className="w-3 h-3 mr-1.5" /> {booking.technician.name}</div>
                        ) : (
                            <span className="text-xs text-gray-500">Not Assigned</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {booking.status === 'pending' && (
                        <QuickAssignDialog assignmentId={booking.id} technicians={technicians} onAssign={(techId, assigner) => assignTechnician(booking.id, techId, assigner)} />
                      )}
                      {booking.status === 'assigned' && (
                        <Button size="sm" variant="outline" onClick={() => handleComplete(booking.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && bookings.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>No bookings found for the last 48 hours matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
