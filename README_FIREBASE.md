# Firebase Integration Guide for CareSRE

## Overview

The backend logic and AI agents are complete. This document explains what the Firebase team needs to implement.

---

## Firestore Collections Required

### 1. `patients` Collection

Each document represents a patient check-in:

```javascript
{
  id: string,            // Auto-generated document ID
  name: string,          // Patient name
  age: number,           // Patient age
  symptoms: string,      // Lowercased symptoms description
  priority: string,      // "LOW" | "MEDIUM" | "HIGH"
  department: string,    // Assigned department
  token: string,         // OPD token (e.g., "GE-042")
  eta: number,           // Estimated wait time in minutes
  position: number,      // Queue position
  reason: string,        // Triage reason
  hasAlert: boolean,     // Whether clinical alert was triggered
  createdAt: number      // Timestamp (Date.now())
}
```

**Indexes needed:**
- `createdAt` (descending) - for recent patients query

---

### 2. `alerts` Collection

Each document represents a clinical alert:

```javascript
{
  id: string,            // Auto-generated document ID
  patientId: string,     // Reference to patient document
  patientName: string,   // Patient name (denormalized)
  priority: string,      // Always "HIGH"
  reason: string,        // Alert reason
  department: string,    // Department
  resolved: boolean,     // Has admin acknowledged
  createdAt: number      // Timestamp
}
```

**Indexes needed:**
- `resolved` + `createdAt` - for unresolved alerts query

---

### 3. `queues` Collection

Each document represents a department queue:

```javascript
// Document ID = department name (e.g., "General Medicine")
{
  activePatients: number,    // Current patient count
  avgConsultTime: number     // Average consultation time (minutes)
}
```

---

## Integration Points

### In `/src/app/api/patient/create/route.ts`

**Line ~50:** Replace mock queue data with Firestore fetch

```typescript
// TODO: Firebase team - Fetch from Firestore /queues/{department}
// Currently:
const mockQueueData: QueueData = { activePatients: 5, avgConsultTime: 15 };

// Replace with:
const queueRef = doc(db, 'queues', triageResult.department);
const queueSnap = await getDoc(queueRef);
const queueData = queueSnap.exists() ? queueSnap.data() : null;
```

**Line ~130:** Save data to Firestore

```typescript
// TODO: Firebase team will implement:
// - Save patientRecord to /patients collection
// - If alertRecord exists, save to /alerts collection
// - Update /queues/{department} activePatients count +1

// Replace with:
await addDoc(collection(db, 'patients'), patientRecord);
if (alertRecord) {
  await addDoc(collection(db, 'alerts'), alertRecord);
}
await updateDoc(doc(db, 'queues', triageResult.department), {
  activePatients: increment(1)
});
```

---

### In `/src/app/api/admin/queue/route.ts`

Replace mock data with Firestore queries:

```typescript
// Patients - most recent 50
const patientsRef = collection(db, 'patients');
const patientsQuery = query(patientsRef, orderBy('createdAt', 'desc'), limit(50));
const patientsSnap = await getDocs(patientsQuery);
const patients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Alerts - unresolved only
const alertsRef = collection(db, 'alerts');
const alertsQuery = query(alertsRef, where('resolved', '==', false), orderBy('createdAt', 'desc'));
const alertsSnap = await getDocs(alertsQuery);
const alerts = alertsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Queue stats - all departments
const queuesRef = collection(db, 'queues');
const queuesSnap = await getDocs(queuesRef);
const queueStats = {};
queuesSnap.forEach(doc => { queueStats[doc.id] = doc.data(); });
```

---

### In `/src/app/api/admin/alerts/[id]/route.ts`

Replace mock update with Firestore update:

```typescript
// Update alert as resolved
await updateDoc(doc(db, 'alerts', id), {
  resolved: true,
  resolvedAt: Date.now()
});
```

---

## Setup Instructions

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project or use existing

2. **Enable Firestore**
   - Navigate to Firestore Database
   - Create database in production mode
   - Set region (recommend asia-south1 for India)

3. **Get Config Values**
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy config values to `.env.local`

4. **Create `/lib/firebase.ts`**
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

5. **Initialize Queue Documents**
   - Create initial documents in `queues` collection for each department
   - Set `activePatients: 0` and `avgConsultTime: 15` as defaults

---

## Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Patients - read/write allowed (add auth check in production)
    match /patients/{patientId} {
      allow read, write: if true;
    }
    
    // Alerts - read/write allowed
    match /alerts/{alertId} {
      allow read, write: if true;
    }
    
    // Queues - read/write allowed
    match /queues/{department} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Note**: In production, add proper authentication checks!

---

## Testing After Integration

1. Start dev server: `npm run dev`
2. Submit a patient through the form
3. Verify document appears in Firestore console
4. Check admin dashboard shows the patient
5. If HIGH priority, verify alert was created

---

## Contact

For questions about the backend logic or agent implementation, refer to the code comments or contact the backend team.
