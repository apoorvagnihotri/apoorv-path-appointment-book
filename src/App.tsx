
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/services" element={<Services />} />
              <Route path="/prescription" element={<Prescription />} />
              <Route path="/test/:testId" element={<TestDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/address" element={<Address />} />
              <Route path="/members" element={<Members />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/manage-addresses" element={<ManageAddresses />} />
              <Route path="/manage-members" element={<ManageMembers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
