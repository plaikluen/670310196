// รันด้วย: node reset.mjs
// ต้องอยู่ใน folder เดียวกับ firebase.json

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ใส่ path ของ service account key ที่ดาวน์โหลดจาก Firebase Console
// Project Settings → Service accounts → Generate new private key
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function resetAll() {
    // 1. รีเซ็ตยอดสนใจ
    await db.doc('survey/total').set({ value: 0 });
    console.log('✓ reset survey/total');

    // 2. รีเซ็ตยอด platform poll
    await db.doc('platformPoll/votes').set({ bsky_discord: 0, mixi2: 0 });
    console.log('✓ reset platformPoll/votes');

    // 3. ลบข้อมูลผู้โหวตทั้งหมด
    const voters = await db.collection('voters').get();
    const batch = db.batch();
    voters.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✓ deleted ${voters.size} voter(s)`);

    console.log('\nรีเซ็ตเสร็จสิ้น!');
    process.exit(0);
}

resetAll().catch(err => {
    console.error(err);
    process.exit(1);
});
