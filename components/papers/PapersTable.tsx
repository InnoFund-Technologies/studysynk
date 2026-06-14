"use client";
import * as React from 'react';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import {IPaper} from "@/lib/types";
import {trimProgram} from "@/lib/utils/helper";
import {usePaperPreview} from "@/context/paperPreviewContext";

interface PapersTableProps {
    papers: IPaper[];
    emptyMessage?: string;
}

const courseCode = (paper: IPaper) =>
    Array.isArray(paper.course?.code) ? paper.course.code.join("/") : paper.course?.code;

export default function PapersTable({papers, emptyMessage = "No papers yet."}: PapersTableProps) {
    const {paper: activePaper, showPaperPreview} = usePaperPreview();

    if (!papers.length) {
        return (
            <Typography level="body-md" textColor="text.tertiary" sx={{py: 6, textAlign: 'center'}}>
                {emptyMessage}
            </Typography>
        );
    }

    return (
        <Sheet variant="outlined" sx={{borderRadius: 8, overflow: 'hidden', mt: 2}}>
            <Table
                hoverRow
                stickyHeader
                sx={{
                    '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
                    '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
                    '& tr > *:nth-child(5)': {textAlign: 'right'},
                    '& th, & td': {
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    '& tbody tr': {cursor: 'pointer'},
                }}>
                <thead>
                <tr>
                    <th style={{width: '22%'}}>Title</th>
                    <th>Code</th>
                    <th style={{width: '20%'}}>Program</th>
                    <th>Examiner</th>
                    <th style={{width: '6%'}}>Year</th>
                    <th>Shared by</th>
                </tr>
                </thead>
                <tbody>
                {papers.map((paper) => (
                    <tr
                        key={paper._id}
                        onClick={() => showPaperPreview(paper)}
                        aria-selected={activePaper?._id === paper._id}
                        style={activePaper?._id === paper._id
                            ? {background: 'var(--joy-palette-primary-softBg)'}
                            : undefined}
                    >
                        <td>{paper.title}</td>
                        <td>{courseCode(paper)}</td>
                        <td>{trimProgram(paper.program.name)}</td>
                        <td>{paper.internalExaminer}</td>
                        <td>{paper.year}</td>
                        <td><Chip>{paper.author.name}</Chip></td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Sheet>
    );
}
