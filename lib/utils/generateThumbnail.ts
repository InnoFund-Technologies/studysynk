import path from "node:path";

/**
 * Render the first page of a PDF to a raster thumbnail (WebP) on the server.
 *
 * Runs only in the Node.js runtime (uses @napi-rs/canvas + the pdfjs legacy
 * build). The page is rendered at a fixed target width so every thumbnail is
 * crisp regardless of the source page size, preserving the page's aspect ratio.
 */

const TARGET_WIDTH = 600;

export async function generateThumbnail(pdf: ArrayBuffer): Promise<Buffer> {
    // Loaded dynamically so these heavy native/server modules never get bundled
    // into edge or client builds.
    const {createCanvas, Path2D, DOMMatrix, ImageData} = await import("@napi-rs/canvas");

    // pdfjs constructs Path2D/DOMMatrix from globals when rendering glyphs and
    // images; @napi-rs/canvas provides Node-compatible implementations.
    const g = globalThis as Record<string, unknown>;
    g.Path2D ??= Path2D;
    g.DOMMatrix ??= DOMMatrix;
    g.ImageData ??= ImageData;

    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Standard (non-embedded) fonts are read from the filesystem by the legacy
    // build's NodeStandardFontDataFactory — a trailing separator is required.
    const standardFontDataUrl =
        path.join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts") + path.sep;

    const doc = await pdfjs.getDocument({
        data: new Uint8Array(pdf),
        disableWorker: true, // no worker on the server; run on the main thread
        standardFontDataUrl,
    } as Parameters<typeof pdfjs.getDocument>[0]).promise;

    try {
        const page = await doc.getPage(1);

        // Scale so the rendered width matches TARGET_WIDTH at the page's own
        // aspect ratio — no stretching or cropping.
        const baseViewport = page.getViewport({scale: 1});
        const scale = TARGET_WIDTH / baseViewport.width;
        const viewport = page.getViewport({scale});

        const canvas = createCanvas(
            Math.ceil(viewport.width),
            Math.ceil(viewport.height),
        );
        const context = canvas.getContext("2d");
        // PDFs assume a white page; the canvas defaults to transparent.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
            // @napi-rs/canvas context is API-compatible with the 2d context
            // pdfjs expects.
            canvasContext: context as unknown as CanvasRenderingContext2D,
            viewport,
        }).promise;

        return canvas.encodeSync("webp", 80);
    } finally {
        await doc.destroy();
    }
}
