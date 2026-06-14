import * as React from "react";
import {notFound} from "next/navigation";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import Styled from "@/components/Styled";
import PdfViewer from "@/components/papers/PdfViewerClient";
import DownloadButton from "@/components/papers/DownloadButton";
import StudyAssistant from "@/components/papers/StudyAssistant";
import {findById} from "@/lib/db";
import {IPaper} from "@/lib/types";
import {getMonth, trimProgram} from "@/lib/utils/helper";

const joinField = (value?: string | string[]) =>
    Array.isArray(value) ? value.join(" / ") : value;

export default async function PaperDetail({params}: {params: {paperId: string}}) {
    const paper = await findById<IPaper>("papers", params.paperId);
    if (!paper) {
        notFound();
    }

    const {
        title, year, university, faculty, department, program, course,
        author, createdAt, internalExaminer, externalExaminer, paperType, url,
    } = paper;

    const details: Array<[string, React.ReactNode]> = [
        ["Year", year],
        ["University", university?.code?.toUpperCase()],
        ["Faculty", faculty?.name],
        ["Department", department?.name],
        ["Program", program?.name ? trimProgram(program.name) : undefined],
        ["Course", joinField(course?.name)],
        ["Course code", joinField(course?.code)],
        ["Paper type", paperType],
        ["Internal examiner", internalExaminer],
        ["External examiner", externalExaminer],
        ["Shared by", author?.name],
        [
            "Added",
            createdAt
                ? `${new Date(createdAt).getDate()} ${getMonth(new Date(createdAt).getMonth(), "short")} ${new Date(createdAt).getFullYear()}`
                : undefined,
        ],
    ];

    return (
        <Styled.Section sx={{pt: 4, pb: {xs: 12, sm: 6}}}>
            <Box sx={{display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap"}}>
                <Box sx={{flex: 1, minWidth: 240}}>
                    <Typography level="h3" sx={{textTransform: "capitalize"}}>{title}</Typography>
                    <Box sx={{display: "flex", gap: 1, mt: 1, flexWrap: "wrap"}}>
                        {university?.code && <Chip size="sm" variant="soft">{university.code.toUpperCase()}</Chip>}
                        {year && <Chip size="sm" variant="soft">{year}</Chip>}
                        {paperType && <Chip size="sm" variant="soft" sx={{textTransform: "capitalize"}}>{paperType}</Chip>}
                    </Box>
                </Box>
                <DownloadButton paper={paper}/>
            </Box>

            <Divider sx={{my: 3}}/>

            <Grid container spacing={4}>
                <Grid xs={12} md={8}>
                    {url ? (
                        <PdfViewer url={url}/>
                    ) : (
                        <Typography level="body-md" textColor="text.tertiary" sx={{py: 8, textAlign: "center"}}>
                            No file is attached to this paper.
                        </Typography>
                    )}
                </Grid>
                <Grid xs={12} md={4}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 1.5,
                            "& > *:nth-child(odd)": {color: "text.secondary"},
                        }}
                    >
                        {details
                            .filter(([, value]) => Boolean(value))
                            .map(([label, value]) => (
                                <React.Fragment key={label}>
                                    <Typography level="body-sm">{label}</Typography>
                                    <Typography level="body-sm" textColor="text.primary"
                                                sx={{textTransform: "capitalize"}}>
                                        {value}
                                    </Typography>
                                </React.Fragment>
                            ))}
                    </Box>

                    <Divider sx={{my: 3}}/>

                    <StudyAssistant paperId={paper._id} title={title}/>
                </Grid>
            </Grid>
        </Styled.Section>
    );
}
