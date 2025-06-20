📱 Exela Realtors Mobile App
A mobile-based real estate application that connects landlords, tenants, buyers, and sellers — streamlining property listing, rental, and management services across Uganda and East Africa.

📌 Features
🔍 Browse Properties: Users can view available properties for rent or sale without creating an account.

🏡 Property Uploading: Landlords and agents can upload property listings (requires login).

📸 Image Slideshows: Each listing includes images and key property information.

✅ Admin Approval: All listings go through admin approval before being published.

🔐 Authentication: Secure user sign-up and login functionality.

📍 Search & Filter: Users can filter by location, price, and type (e.g., rent/sale).

⚙️ Role Management: Admin, landlord, and tenant accounts.

📊 Property Management: Landlords can manage their listed properties directly through the app.

🚀 Tech Stack
Frontend: React Native (Expo Router)

Backend: Node.js + Express

Database: MongoDB (via Mongoose)

Authentication: JWT (JSON Web Tokens)

Storage: Firebase / Cloudinary (for images)

State Management: Redux

Navigation: React Navigation (Stack & Tabs)

📦 Installation
Clone the repo:
git clone https://github.com/jonusgreen/MobileApp.git
cd MobileApp
Install dependencies:
npm install
Run the app:
npx expo start
Make sure you have Expo CLI installed. If not:
npm install -g expo-cli

📁 Folder Structure

/src
  /screens        # All screen components
  /components     # Reusable UI components
  /redux          # Redux store and slices
  /assets         # Static images and fonts
  /navigation     # Navigation setup

🛡️ Environment Variables
Create a .env file for your API keys and secrets:

API_URL=https://yourapi.com
FIREBASE_API_KEY=xxxx
JWT_SECRET=xxxx

✅ To-Do / Upcoming Features
🔔 Push Notifications

🗺️ Map View for Listings

💬 In-App Messaging (future)


🧑‍💻 Author
Jonus Green
Web & Mobile Developer
GitHub https://github.com/jonusgreen

📄 License
This project is licensed under the MIT License.