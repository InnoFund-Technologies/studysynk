/**
 * Upload a paper PDF via the server route, which verifies the user's session and
 * writes to Vercel Blob. Returns the public download URL plus a first-page
 * thumbnail URL (absent if thumbnail generation failed).
 */
export async function uploadPaper(file: File): Promise<{url: string; thumbnailUrl?: string}> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const {message} = await response.json().catch(() => ({message: response.statusText}));
        throw new Error(message || "Upload failed");
    }

    const {url, thumbnailUrl} = await response.json();
    return {url, thumbnailUrl};
}
