22 July 2025
- The search bar on the top allows for reactive searching of "tests" and "home packages".
- Think about the icons for health packages. 
    - Full body, Fever, Heart, Vitamin, Diabetes, Thyroid, Hormones, Cancer, Lifestyle, Pregnancy, Fertility, Allergy, STD, Arthritis, Anemia
- /services page is now functional with the following services: Injection IM/IB, BP measurement, BMI calculation, ECG.
- /prescription page is now functional with the following features:
    - Add a new prescription.
    - View existing prescriptions.
- Can add health packages / services to cart.
- Why choose apoorv pathology section is more icon driven.


23 July 2025
- In the /home page, increase the size of the buttons.
- In the / page we moved the get started button to above the image.
- In the /test pages, we colored the tests a bit differently to make them stand out than packages.
- In the /cart page, we added a user flow for adding tests, members, scheduling and payment.


30 July 2025
- Implemented complete profile management system:
  - Created /profile page for editing user information
  - Added profile fields: Name, Phone (read-only), Email (read-only), Date of Birth, Sex
  - Database trigger automatically creates profile records for new users
  - Profile hook manages data fetching and updates
  - Navigation from Account page "My Profile" button to profile editing page
  - Fixed profile creation for existing users who registered before trigger implementation
- Enhanced Account page to display real profile data from database
- Updated database schema with date_of_birth and sex fields
- Regenerated TypeScript types to match updated database schema
- **Major UI/UX Improvements - Cart Flow Layout Overhaul:**
  - Analyzed and redesigned entire cart booking flow with "window effect" layout
  - Implemented consistent fixed header + scrollable content + fixed continue buttons pattern
  - Updated all 6 cart flow pages: Schedule → TestSelectionSubpage → Members → Payment → Cart → Address
  - Fixed spacing issues: eliminated gaps between continue buttons and bottom navigation
  - Detached continue buttons from embedded card components for better UX consistency
  - **Responsive Design Enhancement:** Replaced all px-based values with responsive rem units
    - Button heights: `h-12` → `min-h-[3rem]`, `h-14` → `min-h-[3.5rem]`
    - Icon containers: `w-12 h-12` → `w-[3rem] h-[3rem]`
    - Improved accessibility and scaling across different devices and zoom levels
  - Applied proper z-index layering: header (z-40), buttons (z-30), bottom nav (z-50)
  - Used Tailwind spacing classes (pt-20, pb-40, h-screen) for consistent layout structure
- **Fixed Critical React Issues in Members Component:**
  - Resolved duplicate React key warnings in TestSelectionSubpage by using unique cart item IDs
  - Fixed infinite loop issue in useEffect that caused "Maximum update depth exceeded" error
  - Implemented proper cart item deduplication using useMemo to prevent unnecessary re-renders
  - Updated member test selection initialization logic to prevent cascading state updates
  - Enhanced test selection interface stability when multiple members are selected


Problems: 
  - Design of the add to cart button for services is not same as health packages.
  - The search bar in the home page isn't what I am expecting it to be, but it works as expected in /tests
  - Login page takes a lot of time to load.


Furture Plans:
- Allow the user to sign up with numbers that are whatsapp supported. Tell them that this will be used to send them reports.

## Progress Update - 2025-08-07

### Booking Cancellation Feature
- Added support for canceling bookings from both the bookings list and booking details page.
- Updated status handling to include `canceled` (with red badge and text).
- Only bookings with status `pending` or `confirmed` can be canceled by the user.
- Added confirmation dialog before canceling a booking.
- UI updates immediately after cancellation, reflecting the new status.
- Past bookings and future bookings are handled separately, and cancellation updates both lists if needed.
- Booking details page now also shows a cancel button for eligible bookings and a message for canceled bookings.

### Other Improvements
- Bookings page now shows only future bookings by default, with a button to load past bookings.
- Improved section headers and visual distinction between upcoming and past bookings.
- All status badges and logic updated to support new and future statuses.

---

## Progress Update - 2025-08-07 (Afternoon)

### Android APK Build Setup Complete
- Successfully configured Capacitor for Android development
- Added Android platform to the project using `npx cap add android`
- Resolved Java compatibility issues by using Android Studio's JBR (JetBrains Runtime)
- Updated Gradle to version 8.10.2 for better Java 21 support
- Updated Android Gradle Plugin to version 8.7.0
- **Successfully built debug APK** for client testing
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
- Configured proper `.gitignore` rules for Android project (commits config files, ignores build artifacts)
- Ready for client testing on Android devices

### Development Environment
- Using Android Studio installation at `/home/apoorv/Downloads/android-studio/bin`
- Java environment: Android Studio's JBR 21.0.6
- Target SDK: Android API 33
- Minimum SDK: Android API 22 (supports Android 5.1+)

**Next Steps:**
- Test APK with client on Android device
- Consider adding support for "paid" status and refund logic in the future
- Add more granular status transitions and admin controls if needed
- Potentially create release APK with signing for production distribution

## Progress Update - 2025-08-08

### Home Page Updates
- Updated "Our Service" text to "Book Test/Package".
- Changed the "Get Help" icon from a message icon to a professional green WhatsApp icon with the label "Get help (WhatsApp)".

### My Booking Page Updates
- Hidden past bookings by default, showing only real-time future bookings.

- Lab selections no longer require scheduling, streamlining the user flow.
- Improved navigation between the cart and booking pages.
- Visual updates to the booking list:
    - WhatsApp icon is now green.
    - Top three bookings are highlighted.
    - Canceled bookings have a muted appearance.
    - Bookings can now be grouped.

---
- Connected "call lab" button on the "Booking Details" page.
- Connected "call lab" button on the "Bookings" page.
