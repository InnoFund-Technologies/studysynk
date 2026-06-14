"use client";
import dynamic from "next/dynamic";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";

// react-pdf relies on the DOM and a web worker, so it cannot be server-rendered.
// Load it client-side only.
const PdfViewer = dynamic(() => import("@/components/papers/PdfViewer"), {
    ssr: false,
    loading: () => (
        <Box sx={{py: 10, display: "flex", justifyContent: "center"}}>
            <CircularProgress/>
        </Box>
    ),
});

export default function PdfViewerClient({url}: {url: string}) {
    return <PdfViewer url={url}/>;
}
