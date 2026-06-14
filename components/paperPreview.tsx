import * as React from "react";
import Image from "next/image";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import Divider from "@mui/joy/Divider";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import DocumentArrowDownIcon from "@heroicons/react/24/outline/DocumentArrowDownIcon";
import {usePaperPreview} from "@/context/paperPreviewContext";
import Chip from "@mui/joy/Chip";
import ShareIcon from "@heroicons/react/24/outline/ShareIcon";
import {getMonth, trimProgram} from "@/lib/utils/helper";

// Curated study-mood photos (Unsplash). One is chosen per paper, kept stable by
// seeding the pick from the paper id so it does not change on re-render.
const STUDY_MOOD_IMAGES = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=774",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=774",
];

export default function PaperPreview() {
    const {paper, showPaperPreview} = usePaperPreview();
    const links = process.env.NEXT_PUBLIC_URL;
    const [isCopied, setIsCopied] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const moodImage = React.useMemo(() => {
        const id = paper?._id ?? "";
        const seed = Array.from(id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        return STUDY_MOOD_IMAGES[seed % STUDY_MOOD_IMAGES.length];
    }, [paper?._id]);

    const downloadPaper = async () => {
        if (!paper?.url) return;
        setIsDownloading(true);
        try {
            const response = await fetch(paper.url);
            if (!response.ok) throw new Error("Failed to fetch paper");

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const courseName = Array.isArray(paper.course?.name)
                ? paper.course.name[0]
                : paper.course?.name;
            const capitalise = (text: string) =>
                text.replace(/\b\w/g, (char) => char.toUpperCase());
            const namePieces = [
                paper.university?.code?.toUpperCase(),
                ...[
                    paper.program?.name,
                    courseName,
                    paper.title,
                ].map((piece) => (piece ? capitalise(piece) : piece)),
                paper.year,
            ]
                .filter(Boolean)
                .join("_");
            const fileName = `${namePieces || "paper"}.pdf`
                .replace(/[/\\?%*:|"<>]/g, "-");
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Error downloading paper:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const sharePaper = async () => {
        const shareUrl = paper?.url ?? links ?? '';
        if (!shareUrl) return;

        const courseName = Array.isArray(paper?.course?.name)
            ? paper?.course?.name[0]
            : paper?.course?.name;
        const shareData: ShareData = {
            title: paper?.title ?? 'StudySynk paper',
            text: [courseName, paper?.title].filter(Boolean).join(' — '),
            url: shareUrl,
        };

        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share(shareData);
                return;
            }
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
        } catch (error) {
            // AbortError is thrown when the user dismisses the native share sheet.
            if ((error as Error)?.name === 'AbortError') return;
            console.error('Error sharing paper:', error);
        }
    }

    React.useEffect(() => {
        if (isCopied) {
            const resetCopiedState = setTimeout(() => {
                setIsCopied(false);
            }, 1500);

            return () => clearTimeout(resetCopiedState);
        }
    }, [isCopied]);

    if (!paper) {
        return null
    }
    const {title, year, university, program, author, course, faculty, department, createdAt} = paper;

    const isOpen = !Boolean(paper?.title === paper?.createdAt);

    return (
        <Sheet
            sx={{
                display: {xs: 'none', sm: isOpen ? 'initial' : 'none'},
                borderLeft: '1px solid',
                borderColor: 'neutral.outlinedBorder',
                overflow: 'auto',
                height: "calc(100vh - 64px)",
            }}
        >
            <Box sx={{p: 2, display: 'flex', alignItems: 'center'}}>
                <Typography level="h5" sx={{flex: 1}}>Paper Preview</Typography>
                <IconButton variant="outlined" color="neutral" size="sm"
                            onClick={() => showPaperPreview(null)}>
                    <XMarkIcon className="w-4 h-4 ss-icon"/>
                </IconButton>
            </Box>
            <Divider/>
            <AspectRatio ratio="21/9">
                <Image
                    alt=""
                    src={moodImage}
                    fill
                    sizes="(max-width: 600px) 100vw, 320px"
                    style={{objectFit: "cover"}}
                />
            </AspectRatio>
            <Box sx={{p: 2, display: 'flex', gap: 1, alignItems: 'center'}}>
                <Typography level="body-sm" mr={1}>
                    Shared with
                </Typography>
                <Chip>{author?.name}</Chip>
            </Box>
            <Divider/>
            <Box sx={{px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography level="body-sm">
                    Share
                </Typography>
                <Box sx={{position: 'relative'}}>
                    <Chip
                        color={"primary"}
                        variant={"solid"}
                        size={"sm"} sx={{
                        position: 'absolute',
                        opacity: isCopied ? 1 : 0,
                        left: '50%',
                        transform: isCopied ? 'translate(-50%, -28px)' : 'translate(-50%, -10px)',
                        transition: 'opacity 0.2s ease, transform 0.2s ease'
                    }}>
                        Copied!
                    </Chip>
                    <IconButton onClick={sharePaper} disabled={!paper.url && !links}>
                        <ShareIcon className={"ss-icon w-5 h-5"}/>
                    </IconButton>
                </Box>
            </Box>
            <Divider/>
            <Box
                sx={{
                    gap: 2,
                    p: 2,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    '& > *:nth-child(odd)': {color: 'text.secondary'},
                }}
            >
                <Typography level="body-sm">Title</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {title}
                </Typography>

                <Typography level="body-sm">Year</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {year}
                </Typography>

                <Typography level="body-sm">University</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'uppercase'}}>
                    {university.code}
                </Typography>

                <Typography level="body-sm">Faculty</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {faculty.name}
                </Typography>

                <Typography level="body-sm">Department</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {department.name}
                </Typography>

                <Typography level="body-sm">Program</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {trimProgram(program.name)}
                </Typography>

                <Typography level="body-sm">Course</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {course.name}
                </Typography>

                <Typography level="body-sm">Created</Typography>
                <Typography level="body-sm" textColor="text.primary" sx={{textTransform: 'capitalize'}}>
                    {new Date(createdAt).getDate()} {getMonth(new Date(createdAt).getMonth(), 'short')} {new Date(createdAt).getFullYear()}
                </Typography>

            </Box>
            <Divider/>
            <Box sx={{py: 2, px: 1}}>
                <Button
                    variant="plain"
                    size="sm"
                    onClick={downloadPaper}
                    loading={isDownloading}
                    disabled={!paper.url}
                    endDecorator={<DocumentArrowDownIcon className="ss-icon w-5 h-5"/>}
                >
                    Download paper
                </Button>
            </Box>
        </Sheet>
    )
}