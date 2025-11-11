# Firestore Data Seeder Scripts

This directory contains scripts to automatically populate Firestore with sample data.

## 📋 **Prerequisites**

1. **Node.js** installed (v18 or higher)
2. **Firebase project** set up with Firestore enabled
3. **Environment variables** configured in `.env` file

## 🚀 **Quick Start**

### **Step 1: Install Dependencies**

Make sure you have `dotenv` installed:

```bash
npm install
```

### **Step 2: Create `.env` File**

Create a `.env` file in the root directory (`samarth-dashboard/.env`) with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Note:** You can find these values in your Firebase Console:
1. Go to Firebase Console → Project Settings
2. Scroll down to "Your apps" section
3. Copy the config values

### **Step 3: Run the Seeder**

```bash
npm run seed:firestore
```

Or directly:

```bash
node scripts/seed-firestore-simple.js
```

## 📊 **What Gets Seeded**

The script will create/update the following documents in Firestore:

1. **`ai_insights/latest`**
   - Predictive alerts
   - Key topics
   - Recommendations
   - Risk districts
   - Top performers

2. **`summary/live_stats`**
   - Total districts
   - Total officers
   - Average HPS score
   - Total cases solved
   - Total recognitions

## ✅ **Expected Output**

```
🔥 Initializing Firebase...
✅ Firebase initialized

📂 Loading sample data...
✅ Sample data loaded

📊 Seeding AI Insights (ai_insights/latest)...
✅ AI Insights seeded successfully!

📈 Seeding Summary (summary/live_stats)...
✅ Summary seeded successfully!

🎉 Firestore seeding completed successfully!

📋 Seeded documents:
   - ai_insights/latest
   - summary/live_stats

💡 Refresh your dashboard to see the changes!
```

## 🔧 **Troubleshooting**

### **Error: Firebase configuration is missing**

**Solution:** Make sure your `.env` file exists and contains all required Firebase configuration variables.

### **Error: Permission denied**

**Solution:** Check your Firestore security rules. For testing, you can temporarily allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Only for development!
    }
  }
}
```

**⚠️ Warning:** Don't use this in production! Set up proper security rules.

### **Error: Cannot find module 'dotenv'**

**Solution:** Install the dependency:

```bash
npm install dotenv
```

### **Error: Module not found**

**Solution:** Make sure you're running the script from the `samarth-dashboard` directory:

```bash
cd samarth-dashboard
npm run seed:firestore
```

## 🔒 **Security Notes**

- Never commit your `.env` file to version control
- Make sure `.env` is in your `.gitignore`
- Use proper Firestore security rules in production
- The script uses `merge: true` to update existing documents without overwriting other fields

## 📝 **Scripts Available**

- **`seed-firestore-simple.js`** - Simple script using Firebase Client SDK (recommended)
- **`seed-firestore.js`** - Advanced script with Admin SDK support (requires service account key)

## 🔄 **Re-running the Script**

You can run the script multiple times. It uses `merge: true`, so it will:
- Update existing documents
- Create new documents if they don't exist
- Preserve other fields in existing documents

## 💡 **Tips**

1. **Test First:** Run the script and check Firebase Console to verify data was created
2. **Check Logs:** The script provides detailed output about what's being seeded
3. **Refresh Dashboard:** After seeding, refresh your dashboard to see the changes
4. **Modify Data:** You can edit the JSON files in `firestore-sample-data/` to customize the data

## 🎯 **Next Steps**

After running the seeder:
1. ✅ Verify data in Firebase Console
2. ✅ Refresh your dashboard
3. ✅ Check that AI Insights and Summary data are displaying correctly
4. ✅ Test all dashboard features

---

**Happy Seeding! 🚀**

