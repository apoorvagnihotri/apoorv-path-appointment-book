# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fc8f742c-4585-4fa4-8871-a8b23652ebf0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fc8f742c-4585-4fa4-8871-a8b23652ebf0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database, Auth, Edge Functions)
- Capacitor (Mobile App Development)

## Email Notification System

This application includes an automated email notification system for booking confirmations:

### Features
- **Instant Notifications**: Sends email to `apoorvpath@gmail.com` when bookings are confirmed
- **Verification Tracking**: Tracks if emails are opened via verification links
- **Auto-Escalation**: Escalates to `deepaagni@gmail.com` if not verified within 2 hours
- **Professional Templates**: HTML email templates with booking details

### Setup
See `EMAIL_NOTIFICATION_SETUP.md` for detailed setup instructions.

### Quick Setup
1. Set up Resend account and get API key
2. Add `RESEND_API_KEY` to Supabase environment variables
3. Deploy edge functions: `supabase functions deploy`
4. Apply database migration: `supabase db push`
5. Set up cron job for escalations

The system automatically sends notifications when bookings are confirmed on the payment page.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fc8f742c-4585-4fa4-8871-a8b23652ebf0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)


## Android APK Generation

Follow these steps to generate an Android APK:

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Capacitor
```bash
npm run cap:init
```
- When prompted:
  - App name: `AppointmentBook`
  - App ID: `com.example.appointmentbook`
  - Web asset directory: `dist`

### 3. Add Android Platform
```bash
npm run cap:android
```

### 4. Build Web Assets
```bash
npm run build
```

### 5. Sync Assets to Android Project
```bash
npm run cap:sync
```

### 6. Open Android Studio
```bash
npx cap open android
```

### 7. Build Signed APK in Android Studio
1. Select **Build > Generate Signed Bundle / APK**
2. Create a new keystore (or use existing)
3. Select APK format
4. Complete the signing process
5. The APK will be generated at:  
   `android/app/build/outputs/apk/release/app-release.apk`

### 8. Install on Device
Transfer the APK to an Android device and install it.

### Troubleshooting:
- Ensure Android SDK is installed
- Set `JAVA_HOME` environment variable
- Minimum SDK version: 22 (set in `android/variables.gradle`)
