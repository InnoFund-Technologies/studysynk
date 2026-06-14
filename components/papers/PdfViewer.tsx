"use client";
import * as React from "react";
import {Document, Page, pdfjs} from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import MagnifyingGlassPlusIcon from "@heroicons/react/24/outline/MagnifyingGlassPlusIcon";
import MagnifyingGlassMinusIcon from "@heroicons/react/24/outline/MagnifyingGlassMinusIcon";

// Serve the worker that matches react-pdf's bundled pdfjs version. Using the
// CDN keeps the worker version in lock-step with `pdfjs.version` regardless of
// any other pdfjs-dist copy in node_modules.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({url}: PdfViewerProps) {
    const [numPages, setNumPages] = React.useState<number>(0);
    const [pageNumber, setPageNumber] = React.useState<number>(1);
    const [scale, setScale] = React.useState<number>(1.1);
    const [error, setError] = React.useState<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = React.useState<number>(0);

    // Render the page to the available container width (capped) for a
    // responsive fit, then let the zoom scale multiply it.
    React.useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setWidth(Math.min(containerRef.current.clientWidth - 32, 900));
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
    const goNext = () => setPageNumber((p) => Math.min(numPages || 1, p + 1));
    const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(2)));
    const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)));

    return (
        <Box ref={containerRef} sx={{width: "100%"}}>
            <Sheet
                variant="outlined"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    borderRadius: "md",
                    mb: 2,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                }}
            >
                <IconButton size="sm" variant="outlined" onClick={goPrev} disabled={pageNumber <= 1}>
                    <ChevronLeftIcon className="w-4 h-4 ss-icon"/>
                </IconButton>
                <Typography level="body-sm" sx={{minWidth: 90, textAlign: "center"}}>
                    Page {pageNumber} / {numPages || "…"}
                </Typography>
                <IconButton size="sm" variant="outlined" onClick={goNext}
                            disabled={!numPages || pageNumber >= numPages}>
                    <ChevronRightIcon className="w-4 h-4 ss-icon"/>
                </IconButton>
                <Box sx={{flex: 1}}/>
                <IconButton size="sm" variant="outlined" onClick={zoomOut} disabled={scale <= 0.6}>
                    <MagnifyingGlassMinusIcon className="w-4 h-4 ss-icon"/>
                </IconButton>
                <Typography level="body-sm" sx={{minWidth: 48, textAlign: "center"}}>
                    {Math.round(scale * 100)}%
                </Typography>
                <IconButton size="sm" variant="outlined" onClick={zoomIn} disabled={scale >= 2.5}>
                    <MagnifyingGlassPlusIcon className="w-4 h-4 ss-icon"/>
                </IconButton>
            </Sheet>

            <Box sx={{display: "flex", justifyContent: "center", overflow: "auto"}}>
                {error ? (
                    <Typography level="body-md" color="danger" sx={{py: 8, textAlign: "center"}}>
                        {error}
                    </Typography>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={({numPages}) => {
                            setNumPages(numPages);
                            setError(null);
                        }}
                        onLoadError={(err) => {
                            console.error("PDF load error:", err);
                            setError("Couldn’t load this PDF. You can still download it below.");
                        }}
                        loading={
                            <Box sx={{py: 10, display: "flex", justifyContent: "center"}}>
                                <CircularProgress/>
                            </Box>
                        }
                    >
                        {width > 0 && (
                            <Page
                                pageNumber={pageNumber}
                                width={width}
                                scale={scale}
                                renderTextLayer
                                renderAnnotationLayer
                            />
                        )}
                    </Document>
                )}
            </Box>
        </Box>
    );
}
