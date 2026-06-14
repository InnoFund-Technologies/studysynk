import * as React from 'react';
import {IPaper} from "@/lib/types";
import {findMany} from "@/lib/db";
import PapersTable from "@/components/papers/PapersTable";

const getRecentPapers = async (): Promise<IPaper[]> => {
    const papers = await findMany<IPaper>("papers");
    // Most recent first, capped to a short list for the home overview.
    return [...papers]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
}

export default async function RecentTable() {
    const papers = await getRecentPapers();

    return <PapersTable papers={papers} emptyMessage="No papers shared yet."/>;
}
