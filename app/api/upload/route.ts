import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import authOptions from "@/lib/utils/authOptions";
import {adminStorage} from "@/lib/firebaseAdmin";

/**
 * Server-side PDF upload. Verifies the NextAuth session, then writes the file to
 * Firebase Storage with the Admin SDK and returns a public download URL. Keeping
 * this server-side means Storage rules can stay fully locked to clients.
 */
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({message: "No file provided"}, {status: 400});
    }
    if (file.type !== "application/pdf") {
        return NextResponse.json({message: "Only PDF files are allowed"}, {status: 400});
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";
    const objectPath = `papers/${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();
    const storedFile = bucket.file(objectPath);

    await storedFile.save(buffer, {
        contentType: "application/pdf",
        resumable: false,
    });
    await storedFile.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(objectPath)}`;
    return NextResponse.json({url});
}
