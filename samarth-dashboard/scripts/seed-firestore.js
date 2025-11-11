/**
 * Firestore Data Seeder Script
 * This script automatically populates Firestore with sample data
 * 
 * Usage: node scripts/seed-firestore.js
 * Or: npm run seed:firestore
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  // Check if Firebase Admin is already initialized
  if (getApps().length === 0) {
    // Option 1: Use service account key file (if available)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account key');
    } else {
      // Option 2: Use environment variables (for client SDK approach)
      // For Admin SDK, we need service account, so we'll use a different approach
      console.log('⚠️  Service account key not found. Using Client SDK approach...');
      return false;
    }
  }
  return true;
}

// Load sample data from JSON files
function loadSampleData() {
  const aiInsightsPath = join(__dirname, '../firestore-sample-data/ai_insights_latest.json');
  const summaryPath = join(__dirname, '../firestore-sample-data/summary_live_stats.json');

  const aiInsights = JSON.parse(readFileSync(aiInsightsPath, 'utf8'));
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

  return { aiInsights, summary };
}

// Seed Firestore using Admin SDK
async function seedFirestoreAdmin() {
  try {
    const db = getFirestore();
    const { aiInsights, summary } = loadSampleData();

    console.log('🌱 Starting Firestore data seeding...\n');

    // Seed AI Insights
    console.log('📊 Seeding AI Insights...');
    const aiInsightsRef = db.collection('ai_insights').doc('latest');
    await aiInsightsRef.set(aiInsights);
    console.log('✅ AI Insights seeded successfully');

    // Seed Summary
    console.log('📈 Seeding Summary...');
    const summaryRef = db.collection('summary').doc('live_stats');
    await summaryRef.set(summary);
    console.log('✅ Summary seeded successfully');

    console.log('\n🎉 Firestore seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Seed Firestore using Client SDK (alternative approach)
async function seedFirestoreClient() {
  try {
    // Dynamic import for ES modules
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    // Initialize Firebase with environment variables
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Firebase configuration is missing. Please check your .env file.');
    }

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const { aiInsights, summary } = loadSampleData();

    console.log('🌱 Starting Firestore data seeding (Client SDK)...\n');

    // Seed AI Insights
    console.log('📊 Seeding AI Insights...');
    const aiInsightsRef = doc(db, 'ai_insights', 'latest');
    await setDoc(aiInsightsRef, aiInsights);
    console.log('✅ AI Insights seeded successfully');

    // Seed Summary
    console.log('📈 Seeding Summary...');
    const summaryRef = doc(db, 'summary', 'live_stats');
    await setDoc(summaryRef, summary);
    console.log('✅ Summary seeded successfully');

    console.log('\n🎉 Firestore seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🚀 Firestore Data Seeder\n');

  // Try Admin SDK first, fall back to Client SDK
  const adminInitialized = initializeFirebaseAdmin();
  
  if (adminInitialized) {
    await seedFirestoreAdmin();
  } else {
    await seedFirestoreClient();
  }
}

main();

