// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/debug-profiles.js
// Description: Debug script to test profile loading and visibility
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

const { execSync } = require('child_process');

console.log('🔍 Debugging Profile Manager...');
console.log('====================================');

// Test if app is accessible
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:9000', { encoding: 'utf8' });
  console.log(`✅ App status: HTTP ${response}`);

  if (response === '200') {
    console.log('✅ App is accessible at http://localhost:9000');
    console.log('');
    console.log('📋 Testing Profile Manager...');
    console.log('Please manually check the following:');
    console.log('1. Open http://localhost:9000 in browser');
    console.log('2. Click the profiles button (should be visible)');
    console.log('3. Look for Japanese exercise profiles:');
    console.log('   - Rajio Taiso (📻)');
    console.log('   - Tai Chi Morning (🌅)');
    console.log('   - Shinrin-yoku (🌲)');
    console.log('   - Hara Hachi Bu (🍵)');
    console.log('   - Ikigai Reflection (🎋)');
    console.log('   - Zazen Sitting (🧘)');
    console.log('4. Test creating custom profiles with exercise series');
    console.log('5. Test breathing profiles (Box Breathing, 4-7-8, etc.)');

  } else {
    console.log('❌ App is not accessible');
  }
} catch (error) {
  console.log(`❌ Error checking app: ${error.message}`);
}

console.log('');
console.log('📁 Checking file structure...');

// Check if key files exist
const files = [
  'src/components/profiles/ProfileManager.tsx',
  'src/data/japanese-exercise-series.ts',
  'src/data/breathing-patterns.ts',
  'src/types/profile.types.ts'
];

files.forEach(file => {
  try {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${file}: ${error.message}`);
  }
});

console.log('');
console.log('🎯 Manual Testing Required:');
console.log('Open browser to http://localhost:9000 and verify profiles are visible');