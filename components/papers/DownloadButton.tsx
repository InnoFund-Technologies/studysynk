"use client";
import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import DocumentArrowDownIcon from "@heroicons/react/24/outline/DocumentArrowDownIcon";
import {IPaper} from "@/lib/types";

const capitalise = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

export function buildFileName(paper: IPaper): string {
    const courseName = Array.isArray(paper.course?.name) ? paper.course.name[0] : paper.course?.name;
    const pieces = [
        paper.university?.code?.toUpperCase(),
        ...[paper.program?.name, courseName, paper.title].map((p) => (p ? capitalise(p) : p)),
        paper.year,
    ]
        .filter(Boolean)
        .join("_");
    return `${pieces || "paper"}.pdf`.replace(/[/\\?%*:|"<>]/g, "-");
}

export default function DownloadButton({paper}: {paper: IPaper}) {
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [error, setError] = React.useState(false);

    const download = async () => {
        if (!paper.url) return;
        setIsDownloading(true);
        setError(false);
        try {
            const response = await fetch(paper.url);
            if (!response.ok) throw new Error("Failed to fetch paper");
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = buildFileName(paper);
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error("Error downloading paper:", err);
            setError(true);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5}}>
            <Button
                variant="soft"
                onClick={download}
                loading={isDownloading}
                disabled={!paper.url}
                endDecorator={<DocumentArrowDownIcon className="ss-icon w-5 h-5"/>}
                sx={{fontWeight: 500}}
            >
                Download paper
            </Button>
            {error && (
                <Typography level="body-xs" color="danger">
                    Couldn’t download. Please try again.
                </Typography>
            )}
        </Box>
    );
}
