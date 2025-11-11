/**
 * Simple Firestore Data Seeder (Client SDK)
 * This is a simpler version that uses Firebase Client SDK
 * 
 * Usage: node scripts/seed-firestore-simple.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Load sample data
function loadSampleData() {
  try {
    const aiInsightsPath = join(__dirname, '../firestore-sample-data/ai_insights_latest.json');
    const summaryPath = join(__dirname, '../firestore-sample-data/summary_live_stats.json');

    const aiInsights = JSON.parse(readFileSync(aiInsightsPath, 'utf8'));
    const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

    return { aiInsights, summary };
  } catch (error) {
    console.error('❌ Error loading sample data:', error.message);
    process.exit(1);
  }
}

// Seed Firestore
async function seedFirestore() {
  try {
    // Validate Firebase config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        'Firebase configuration is missing!\n' +
        'Please make sure you have a .env file with the following variables:\n' +
        '- VITE_FIREBASE_API_KEY\n' +
        '- VITE_FIREBASE_AUTH_DOMAIN\n' +
        '- VITE_FIREBASE_PROJECT_ID\n' +
        '- VITE_FIREBASE_STORAGE_BUCKET\n' +
        '- VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
        '- VITE_FIREBASE_APP_ID'
      );
    }

    // Initialize Firebase
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized\n');

    // Load sample data
    console.log('📂 Loading sample data...');
    const { aiInsights, summary } = loadSampleData();
    console.log('✅ Sample data loaded\n');

    // Seed AI Insights
    console.log('📊 Seeding AI Insights (ai_insights/latest)...');
    const aiInsightsRef = doc(db, 'ai_insights', 'latest');
    await setDoc(aiInsightsRef, aiInsights, { merge: true });
    console.log('✅ AI Insights seeded successfully!\n');

    // Seed Summary
    console.log('📈 Seeding Summary (summary/live_stats)...');
    const summaryRef = doc(db, 'summary', 'live_stats');
    await setDoc(summaryRef, summary, { merge: true });
    console.log('✅ Summary seeded successfully!\n');

    console.log('🎉 Firestore seeding completed successfully!');
    console.log('\n📋 Seeded documents:');
    console.log('   - ai_insights/latest');
    console.log('   - summary/live_stats');
    console.log('\n💡 Refresh your dashboard to see the changes!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding Firestore:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure your .env file exists and has all Firebase config variables');
    console.error('2. Check that your Firebase project has Firestore enabled');
    console.error('3. Verify your Firestore security rules allow writes');
    console.error('4. Make sure you have the correct Firebase project ID');
    process.exit(1);
  }
}

// Run the seeder
seedFirestore();

