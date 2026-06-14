/**
 * Upload a paper PDF via the server route, which verifies the user's session and
 * writes to Firebase Storage with the Admin SDK. Returns the public download URL.
 */
export async function uploadPaper(file: File): Promise<string> {
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

    const {url} = await response.json();
    return url as string;
}
