import * as admin from "firebase-admin";

import { getAuth } from "firebase-admin/auth";

import serviceAccount from "../../../serviceAccountKey.json";

const credentialCert = admin.credential.cert(serviceAccount as any);

const app = admin.initializeApp({
  credential: credentialCert,
});

export const firebaseAuth = getAuth(app);

export const firestoreInstance = admin.firestore();
