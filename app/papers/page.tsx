"use client";
import Grid from "@mui/joy/Grid";
import PaperCard from "@/components/paperCard";
import * as React from "react";
import Styled from "@/components/Styled";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import FilterOptions, {PapersView} from "@/components/papers/filterOptions";
import PapersTable from "@/components/papers/PapersTable";
import FacetFilters, {FACETS, FacetKey} from "@/components/papers/FacetFilters";
import {IPaper} from "@/lib/types";
import {usePaperPreview} from "@/context/paperPreviewContext";
import {useSearchParams} from "next/navigation";

// Flatten the fields a user would reasonably search by into one lowercase
// haystack per paper.
const searchableText = (paper: IPaper): string => {
    const courseName = Array.isArray(paper.course?.name)
        ? paper.course.name.join(" ")
        : paper.course?.name;
    const courseCode = Array.isArray(paper.course?.code)
        ? paper.course.code.join(" ")
        : paper.course?.code;
    return [
        paper.title,
        paper.year,
        paper.university?.name,
        paper.university?.code,
        paper.faculty?.name,
        paper.department?.name,
        paper.program?.name,
        courseName,
        courseCode,
        paper.author?.name,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
};

function PapersList() {
    const [papers, setPapers] = React.useState<IPaper[]>([]);
    const [view, setView] = React.useState<PapersView>("grid");
    const {showPaperPreview} = usePaperPreview();
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const searchParams = useSearchParams();
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();

    React.useEffect(() => {
        (async () => {
            const papers = await fetch('/api/papers', {
                method: 'GET',
            }).then((response) => response.json());
            setPapers(papers)
        })();
    }, []);

    // Active facet selections, read from the URL.
    const facetSelections = React.useMemo(() => {
        const out: Partial<Record<FacetKey, string>> = {};
        (Object.keys(FACETS) as FacetKey[]).forEach((key) => {
            const value = searchParams.get(key);
            if (value) out[key] = value;
        });
        return out;
    }, [searchParams]);

    const filteredPapers = React.useMemo(() => {
        return papers.filter((paper) => {
            if (query && !searchableText(paper).includes(query)) return false;
            return (Object.keys(facetSelections) as FacetKey[]).every(
                (key) => FACETS[key](paper) === facetSelections[key],
            );
        });
    }, [papers, query, facetSelections]);

    const hasActiveFilters = query.length > 0 || Object.keys(facetSelections).length > 0;

    const handlePaperViewClose = () => {
        showPaperPreview(null)
    }

    React.useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('click', handlePaperViewClose)
        }
        return () => {
            if (container) {
                container.removeEventListener('click', handlePaperViewClose)
            }
        }
    });

    return (
        <Styled.Section sx={{pb: {xs: 10}}}>
            <Box>
                <Box sx={{pt: 2}}>
                    <FacetFilters papers={papers}/>
                </Box>
                <FilterOptions view={view} onViewChange={setView}/>
                {hasActiveFilters && (
                    <Typography level="body-sm" sx={{mb: 2}}>
                        {filteredPapers.length} result{filteredPapers.length === 1 ? '' : 's'}
                        {query ? ` for “${query}”` : ''}
                    </Typography>
                )}
                {filteredPapers.length === 0 ? (
                    <Typography level="body-md" textColor="text.tertiary" sx={{py: 6, textAlign: 'center'}}>
                        {hasActiveFilters ? 'No papers match these filters.' : 'No papers yet.'}
                    </Typography>
                ) : view === "list" ? (
                    <PapersTable papers={filteredPapers}/>
                ) : (
                    <Grid ref={containerRef} container spacing={3} columns={12}>
                        {filteredPapers.map((paper: IPaper, index: number) => (
                            <Grid xs={12} sm={6} md={4} key={index}>
                                <PaperCard paper={paper} view="grid"/>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Styled.Section>
    )
}

export default function Papers() {
    // useSearchParams requires a Suspense boundary in the App Router.
    return (
        <React.Suspense>
            <PapersList/>
        </React.Suspense>
    )
}
