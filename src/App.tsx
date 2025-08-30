import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import Packages from "./pages/Packages";
import Services from "./pages/Services";
import Prescription from "./pages/Prescription";
import TestDetails from "./pages/TestDetails";
import Bookings from "./pages/Bookings";
import ContactSupport from "./pages/ContactSupport";
import BookingDetails from "./pages/BookingDetails";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Members from "./pages/Members";
import Schedule from "./pages/Schedule";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import Onboarding from "./pages/Onboarding";
import ManageAddresses from "./pages/ManageAddresses";
import ManageMembers from "./pages/ManageMembers";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AssignBooking from "./pages/AssignBooking";
import BookingDashboard from "./pages/BookingDashboard";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/assign-booking/:token" element={<AssignBooking />} />

              {/* Authenticated Routes */}
              <Route path="/tests" element={<RequireAuth><Tests /></RequireAuth>} />
              <Route path="/tests/:id" element={<RequireAuth><TestDetails /></RequireAuth>} />
              <Route path="/packages" element={<RequireAuth><Packages /></RequireAuth>} />
              <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
              <Route path="/upload-prescription" element={<RequireAuth><Prescription /></RequireAuth>} />
              <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
              <Route path="/bookings/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
              <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
              <Route path="/address" element={<RequireAuth><Address /></RequireAuth>} />
              <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
              <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />
              <Route path="/booking-confirmation/:id" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />
              
              {/* Account Management */}
              <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/members" element={<RequireAuth><Members /></RequireAuth>} />
              <Route path="/manage-members" element={<RequireAuth><ManageMembers /></RequireAuth>} />
              <Route path="/manage-addresses" element={<RequireAuth><ManageAddresses /></RequireAuth>} />
              <Route path="/contact-support" element={<RequireAuth><ContactSupport /></RequireAuth>} />

              {/* Admin Routes */}
              <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
                <Route path="/booking-dashboard" element={<BookingDashboard />} />
              </Route>

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
