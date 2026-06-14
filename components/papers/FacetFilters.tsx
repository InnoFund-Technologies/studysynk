"use client";
import * as React from "react";
import Box from "@mui/joy/Box";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {IPaper} from "@/lib/types";
import {trimProgram} from "@/lib/utils/helper";

// The URL param key paired with how to read its value off a paper.
export const FACETS = {
    university: (p: IPaper) => p.university?.code?.toUpperCase(),
    year: (p: IPaper) => p.year,
    type: (p: IPaper) => p.paperType,
    program: (p: IPaper) => p.program?.name,
} as const;

export type FacetKey = keyof typeof FACETS;

const LABELS: Record<FacetKey, string> = {
    university: "University",
    year: "Year",
    type: "Paper type",
    program: "Program",
};

const displayValue = (key: FacetKey, value: string) =>
    key === "program" ? trimProgram(value) : value;

interface FacetFiltersProps {
    papers: IPaper[];
}

export default function FacetFilters({papers}: FacetFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Distinct, sorted option values per facet, derived from the loaded papers.
    const options = React.useMemo(() => {
        const out = {} as Record<FacetKey, string[]>;
        (Object.keys(FACETS) as FacetKey[]).forEach((key) => {
            const values = new Set<string>();
            papers.forEach((p) => {
                const v = FACETS[key](p);
                if (v) values.add(v);
            });
            out[key] = Array.from(values).sort();
        });
        return out;
    }, [papers]);

    const setFacet = (key: FacetKey, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
    };

    const clearAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        (Object.keys(FACETS) as FacetKey[]).forEach((key) => params.delete(key));
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
    };

    const activeCount = (Object.keys(FACETS) as FacetKey[]).filter((k) => searchParams.get(k)).length;

    return (
        <Box sx={{display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-end"}}>
            {(Object.keys(FACETS) as FacetKey[]).map((key) => {
                const current = searchParams.get(key);
                if (options[key].length === 0) return null;
                return (
                    <FormControl key={key} size="sm" sx={{minWidth: 150}}>
                        <FormLabel>{LABELS[key]}</FormLabel>
                        <Select
                            size="sm"
                            placeholder={`All`}
                            value={current ?? null}
                            onChange={(_e, value) => setFacet(key, value as string | null)}
                            slotProps={{button: {sx: {textTransform: key === "program" ? "capitalize" : "none"}}}}
                        >
                            <Option value="">All</Option>
                            {options[key].map((value) => (
                                <Option
                                    key={value}
                                    value={value}
                                    sx={{textTransform: key === "program" ? "capitalize" : "none"}}
                                >
                                    {displayValue(key, value)}
                                </Option>
                            ))}
                        </Select>
                    </FormControl>
                );
            })}
            {activeCount > 0 && (
                <Button size="sm" variant="plain" color="neutral" onClick={clearAll} sx={{mb: 0.25}}>
                    Clear ({activeCount})
                </Button>
            )}
        </Box>
    );
}
