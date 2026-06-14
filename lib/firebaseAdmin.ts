import {App, applicationDefault, cert, getApp, getApps, initializeApp, ServiceAccount} from "firebase-admin/app";
import {Firestore, getFirestore} from "firebase-admin/firestore";
import {getStorage, Storage} from "firebase-admin/storage";

/**
 * Server-side Firebase Admin initialization.
 *
 * Credentials come from FIREBASE_SERVICE_ACCOUNT_KEY (stringified service-account
 * JSON); the storage bucket from FIREBASE_STORAGE_BUCKET. Initialization is lazy
 * so the app can boot without credentials — an error is only thrown when a route
 * actually touches Firestore/Storage, mirroring the previous lazy DB connection.
 */
let app: App | undefined;

function getAdminApp(): App {
    if (getApps().length) return getApp();
    if (app) return app;

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const credential = raw
        ? cert(JSON.parse(raw) as ServiceAccount)
        : applicationDefault();

    app = initializeApp({
        credential,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    return app;
}

function lazyProxy<T extends object>(resolve: () => T): T {
    return new Proxy({} as T, {
        get: (_t, prop) => {
            const target = resolve();
            const value = Reflect.get(target, prop);
            return typeof value === "function" ? value.bind(target) : value;
        },
    });
}

export const adminDb = lazyProxy<Firestore>(() => getFirestore(getAdminApp()));
export const adminStorage = lazyProxy<Storage>(() => getStorage(getAdminApp()));

export default getAdminApp;
