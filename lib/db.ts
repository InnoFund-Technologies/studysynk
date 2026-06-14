import {adminDb} from "@/lib/firebaseAdmin";
import {FieldValue, Query} from "firebase-admin/firestore";

/**
 * Firestore data-access layer. Replaces the Mongoose models.
 *
 * Each model is a top-level Firestore collection. Documents are stored without
 * an `_id` field; the Firestore document id IS the id. `serialize()` maps a
 * snapshot back into the `_id`-shaped objects the rest of the app expects.
 */

export const COLLECTIONS = {
    universities: "universities",
    faculties: "faculties",
    departments: "departments",
    programs: "programs",
    courses: "courses",
    papers: "papers",
    students: "students",
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

const col = (name: CollectionName) => adminDb.collection(COLLECTIONS[name]);

type WithId<T> = T & {_id: string};

/** Convert Firestore Timestamps to ISO strings so values are JSON-serializable. */
function normalize(value: unknown): unknown {
    if (value && typeof value === "object") {
        if (typeof (value as {toDate?: unknown}).toDate === "function") {
            return (value as {toDate: () => Date}).toDate().toISOString();
        }
        if (Array.isArray(value)) {
            return value.map(normalize);
        }
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            out[k] = normalize(v);
        }
        return out;
    }
    return value;
}

function serialize<T>(snap: FirebaseFirestore.DocumentSnapshot): WithId<T> {
    return {_id: snap.id, ...(normalize(snap.data()) as T)} as WithId<T>;
}

/**
 * Find one document by a field filter, or null. Defaults to equality; pass an
 * operator (e.g. "array-contains") for other comparisons. Returns null for an
 * undefined value rather than handing it to Firestore, which would throw.
 */
export async function findOne<T>(
    name: CollectionName,
    field: string,
    value: unknown,
    op: FirebaseFirestore.WhereFilterOp = "==",
): Promise<WithId<T> | null> {
    if (value === undefined) return null;
    const snap = await col(name).where(field, op, value).limit(1).get();
    if (snap.empty) return null;
    return serialize<T>(snap.docs[0]);
}

/** Fetch a single document by id, or null. */
export async function findById<T>(
    name: CollectionName,
    id: string,
): Promise<WithId<T> | null> {
    const snap = await col(name).doc(id).get();
    if (!snap.exists) return null;
    return serialize<T>(snap);
}

/** Fetch all documents, optionally filtered by a single field equality. */
export async function findMany<T>(
    name: CollectionName,
    filter?: {field: string; value: unknown},
): Promise<WithId<T>[]> {
    let query: Query = col(name);
    if (filter) {
        query = query.where(filter.field, "==", filter.value);
    }
    const snap = await query.get();
    return snap.docs.map((d) => serialize<T>(d));
}

/** Create a document. Returns the new id. `timestamps` adds createdAt/updatedAt. */
export async function create(
    name: CollectionName,
    data: Record<string, unknown>,
    timestamps = false,
): Promise<string> {
    const payload = {...data};
    delete payload._id;
    if (timestamps) {
        const now = new Date().toISOString();
        payload.createdAt = now;
        payload.updatedAt = now;
    }
    const ref = await col(name).add(payload);
    return ref.id;
}

/** Patch a document by id. */
export async function update(
    name: CollectionName,
    id: string,
    data: Record<string, unknown>,
): Promise<void> {
    const payload = {...data};
    delete payload._id;
    await col(name).doc(id).update(payload);
}

/** Whether a document exists in the given collection. */
export async function exists(
    name: CollectionName,
    id: string,
): Promise<boolean> {
    const snap = await col(name).doc(id).get();
    return snap.exists;
}

/**
 * Append a value to an array field on a parent document (replaces the Mongoose
 * `push` + `save` pattern). No-ops if the parent document does not exist, so a
 * stale id never throws NOT_FOUND. Returns whether the update was applied.
 */
export async function pushToArray(
    name: CollectionName,
    id: string,
    field: string,
    value: unknown,
): Promise<boolean> {
    if (!(await exists(name, id))) return false;
    await col(name).doc(id).update({[field]: FieldValue.arrayUnion(value)});
    return true;
}

export {col};
