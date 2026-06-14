"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Styled from "@/components/Styled";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";

export default function AuthError({
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
                minHeight: "100vh",
                px: 2,
                py: 8,
            }}
        >
            <Styled.Header sx={{fontSize: {xs: "xl4", md: "3rem"}}}>
                Authentication error
            </Styled.Header>
            <Typography level="body-md" textColor="text.secondary" sx={{maxWidth: 460, mb: 3}}>
                We couldn’t complete the sign-in. Please try again, and if it keeps happening reach
                out and we’ll help you get in.
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
                <Button variant="plain" color="neutral" component="a" href="/signin">
                    Back to sign in
                </Button>
            </Box>
        </Styled.Section>
    );
}
