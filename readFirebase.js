const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function readAllReports() {
  console.log("Fetching users...");
  const usersSnapshot = await db.collection('users').get();
  
  if (usersSnapshot.empty) {
    console.log('No users found in database.');
    return;
  }

  for (const userDoc of usersSnapshot.docs) {
    console.log(`\nUser: ${userDoc.id} (${userDoc.data().email || 'No Email'})`);
    
    const reportsSnapshot = await db.collection(`users/${userDoc.id}/reports`).get();
    if (reportsSnapshot.empty) {
      console.log('  No reports found for this user.');
    } else {
      reportsSnapshot.forEach(reportDoc => {
        const data = reportDoc.data();
        console.log(`  Report: ${reportDoc.id} | Filename: ${data.filename} | Type: ${data.reportType}`);
        if (data.filename && data.filename.toLowerCase().includes('explore')) {
            console.log(`\n=== MATCH FOUND! "explored me" ===`);
            console.log(JSON.stringify(data.aiAnalysis || data, null, 2));
            console.log(`==================================\n`);
        }
      });
    }
  }
}

readAllReports()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
