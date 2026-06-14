import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import DocumentIcon from "@heroicons/react/24/outline/DocumentIcon";
import { IPaper } from "@/lib/types";
import { usePaperPreview } from "@/context/paperPreviewContext";
import { getMonth } from "@/lib/utils/helper";
import * as React from "react";
import Image from "next/image";


interface FileCardProps {
    paper: IPaper
}

export default function PaperCard({ paper }: FileCardProps) {
    const { showPaperPreview } = usePaperPreview();
    const { createdAt, thumbnailUrl, title } = paper;
    // Older papers predate server-side thumbnails, or generation may have
    // failed — fall back to a document-icon placeholder.
    const [imageOk, setImageOk] = React.useState<boolean>(Boolean(thumbnailUrl));

    return (
        <Card
            variant="outlined"
            onClick={() => showPaperPreview(paper)}
            sx={{
                p: 0,
                boxShadow: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                minWidth: 230,
                maxWidth: 310,
                minHeight: 280,
                mx: 'auto',
            }}
        >
            <CardOverflow
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'neutral.outlinedBorder',
                    borderRadius: 0,
                }}
            >
                <AspectRatio minHeight={230} color="neutral">
                    {imageOk && thumbnailUrl ? (
                        <Image
                            src={thumbnailUrl}
                            alt={`Preview of ${title}`}
                            height={230}
                            width={160}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={() => setImageOk(false)}
                        />
                    ) : (
                       <DocumentIcon className="ss-icon"  /> 
                    )}
                </AspectRatio>
            </CardOverflow>
            <Box sx={{ display: 'flex', alignItems: 'start', width: '100%', px: 2 }}>
                <Box sx={{ flex: 1, maxHeight: 54, pb: 2, width: '100%' }}>
                    <Typography level="title-sm"
                        sx={{
                            textTransform: 'capitalize',
                            width: '100%',
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            display: "inline-block",
                            overflow: "hidden"
                        }}>
                        {title}
                    </Typography><br />
                    <Typography level="body-xs">
                        Added {new Date(createdAt).getDate()} {getMonth(new Date(createdAt).getMonth(), 'short')} {new Date(createdAt).getFullYear()}
                    </Typography>
                </Box>
            </Box>
        </Card>

    )
}
