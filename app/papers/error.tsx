"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Styled from "@/components/Styled";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";

export default function PapersError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <Styled.Section
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "60vh",
                px: 2,
                py: 8,
            }}
        >
            <Styled.Header sx={{fontSize: {xs: "xl4", md: "3rem"}}}>
                Couldn’t load papers
            </Styled.Header>
            <Typography level="body-md" textColor="text.secondary" sx={{maxWidth: 480, mb: 3}}>
                We hit a snag while fetching the papers. Please try again in a moment.
            </Typography>
            <Box sx={{display: "flex", gap: 1.5}}>
                <Button
                    variant="soft"
                    onClick={reset}
                    sx={{fontWeight: 500}}
                    startDecorator={<ArrowPathIcon className="w-5 h-5 ss-icon"/>}
                >
                    Try again
                </Button>
                <Button variant="plain" color="neutral" component="a" href="/">
                    Go home
                </Button>
            </Box>
        </Styled.Section>
    );
}
