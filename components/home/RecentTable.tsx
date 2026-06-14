import * as React from 'react';
import Table from '@mui/joy/Table';
import {IPaper} from "@/lib/types";
import Chip from "@mui/joy/Chip";
import {findMany} from "@/lib/db";
import {trimProgram} from "@/lib/utils/helper";

const getCourses = async (): Promise<IPaper[]> => {
    return findMany<IPaper>("papers");
}

export default async function RecentTable() {
    const papers = await getCourses();

    return (
        <Table variant="outlined"
               sx={{
                   '& tr > *:nth-child(5)': {
                       textAlign: 'right',
                   }, '& th, & td': {
                       textTransform: 'capitalize',
                       whiteSpace: 'nowrap',
                       overflow: 'hidden',
                       textOverflow: 'ellipsis'
                   }, borderRadius: 8, overflow: "hidden", mt: 2
               }}>
            <thead>
            <tr>
                <th style={{width: '20%'}}>Title</th>
                <th>Code</th>
                <th style={{width: '20%'}}>Program</th>
                <th>Examiner</th>
                <th style={{width: '5%'}}>Year</th>
                <th>Shared by</th>
            </tr>
            </thead>
            <tbody>
            {papers.map((paper) => (
                <tr key={paper._id}>
                    <td>{paper.title}</td>
                    <td>{paper.course.code}</td>
                    <td>{trimProgram(paper.program.name)}</td>
                    <td>{paper.internalExaminer}</td>
                    <td>{paper.year}</td>
                    <td><Chip>{paper.author.name}</Chip></td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
}
