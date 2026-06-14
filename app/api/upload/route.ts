import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {put} from "@vercel/blob";
import authOptions from "@/lib/utils/authOptions";
import {generateThumbnail} from "@/lib/utils/generateThumbnail";

// PDF rasterization needs the Node.js runtime (native canvas), not edge.
export const runtime = "nodejs";

/**
 * Server-side PDF upload. Verifies the NextAuth session, then writes the file to
 * Vercel Blob and returns the public download URL. Keeping this server-side means
 * the BLOB_READ_WRITE_TOKEN never reaches the client. A WebP thumbnail of the
 * first page is generated and stored alongside the PDF.
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

    const id = crypto.randomUUID();
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";

    const blob = await put(`papers/${id}.${ext}`, file, {
        access: "public",
        contentType: "application/pdf",
    });

    // Generate and store a first-page thumbnail. If rasterization fails (e.g. a
    // malformed PDF), still return the upload so the paper can be submitted —
    // the card falls back to a placeholder when thumbnailUrl is absent.
    let thumbnailUrl: string | undefined;
    try {
        const thumbnail = await generateThumbnail(await file.arrayBuffer());
        const thumbBlob = await put(`papers/${id}.webp`, thumbnail, {
            access: "public",
            contentType: "image/webp",
        });
        thumbnailUrl = thumbBlob.url;
    } catch (error) {
        console.error("Thumbnail generation failed:", error);
    }

    return NextResponse.json({url: blob.url, thumbnailUrl});
}
