"use client";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import Input from "@mui/joy/Input";
import * as React from "react";
import IconButton from "@mui/joy/IconButton";
import Box from "@mui/joy/Box";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export default function Search() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = React.useState<string>(searchParams.get("q") ?? "");

    // Keep the input in sync when the query param changes from elsewhere
    // (e.g. navigation, back/forward).
    React.useEffect(() => {
        setValue(searchParams.get("q") ?? "");
    }, [searchParams]);

    const commit = React.useCallback(
        (next: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (next) {
                params.set("q", next);
            } else {
                params.delete("q");
            }
            // Search results live on the papers page; route there while searching.
            const base = next ? "/papers" : pathname;
            const queryString = params.toString();
            router.replace(queryString ? `${base}?${queryString}` : base);
        },
        [pathname, router, searchParams]
    );

    // Debounce URL updates so we don't push a route on every keystroke.
    React.useEffect(() => {
        if (value === (searchParams.get("q") ?? "")) return;
        const timeout = setTimeout(() => commit(value.trim()), 300);
        return () => clearTimeout(timeout);
    }, [value, commit, searchParams]);

    return (
        <Box sx={{display: {xs: 'none', md: 'initial'}}}>
            <Input
                size="sm"
                variant="soft"
                placeholder="Search anything…"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                endDecorator={
                    <MagnifyingGlassIcon className="w-5 h-5 ss-icon"/>
                }
                sx={{
                    flexBasis: '500px',
                    p: 1, px: 1.5,
                    display: {
                        xs: 'none',
                        md: 'flex',
                    },
                }}
            />
            <IconButton
                sx={{
                    '--IconButton-radius': '50%',
                    width: 38,
                    height: 38,
                    ml: 'auto',
                    mr: 0.5,
                    display: {xs: 'inline-flex', sm: 'none'},
                }}
                id="toggle-mode"
                size="sm"
                variant="outlined"
                color="neutral">
                <MagnifyingGlassIcon className="w-5 h-5 ss-icon"/>
            </IconButton>
        </Box>
    )
}
