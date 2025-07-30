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


Problems: 
  - Design of the add to cart button for services is not same as health packages.
  - The search bar in the home page isn't what I am expecting it to be, but it works as expected in /tests
  - The current flow of cart isn't correctly working, need to fix all the pages.
  - Login page takes a lot of time to load.


Furture Plans:
- Allow the user to sign up with numbers that are whatsapp supported. Tell them that this will be used to send them reports.
