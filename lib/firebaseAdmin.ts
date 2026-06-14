import {App, applicationDefault, cert, getApp, getApps, initializeApp, ServiceAccount} from "firebase-admin/app";
import {Firestore, getFirestore} from "firebase-admin/firestore";

/**
 * Server-side Firebase Admin initialization (Firestore).
 *
 * Credentials come from FIREBASE_SERVICE_ACCOUNT_KEY (stringified service-account
 * JSON). Initialization is lazy so the app can boot without credentials — an
 * error is only thrown when a route actually touches Firestore, mirroring the
 * previous lazy DB connection. File uploads use Vercel Blob, not Storage.
 */
let app: App | undefined;

function getAdminApp(): App {
    if (getApps().length) return getApp();
    if (app) return app;

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    let credential;
    if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        // In .env files the PEM's newlines are stored as the literal
        // characters "\n"; restore them so the key parses as valid PEM.
        // Google's service-account JSON uses snake_case (private_key).
        for (const key of ["private_key", "privateKey"]) {
            if (typeof parsed[key] === "string") {
                parsed[key] = (parsed[key] as string).replace(/\\n/g, "\n");
            }
        }
        credential = cert(parsed as ServiceAccount);
    } else {
        credential = applicationDefault();
    }

    app = initializeApp({credential});
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

export default getAdminApp;
