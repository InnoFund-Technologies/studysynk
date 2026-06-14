"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {signIn, useSession} from "next-auth/react";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import CircularProgress from "@mui/joy/CircularProgress";

/**
 * With Google-only auth there is no separate sign-up form: a student record is
 * provisioned automatically on first Google sign-in. NextAuth routes first-time
 * users here (`newUser`), so we send authenticated users on to the app and offer
 * Google sign-in to anyone who lands here unauthenticated.
 */
export default function Signup() {
    const router = useRouter();
    const {status} = useSession();

    React.useEffect(() => {
        if (status === "authenticated") {
            router.replace("/");
        }
    }, [status, router]);

    return (
        <Container>
            <Stack justifyContent="center" alignItems="center" height="100vh" spacing={3}>
                <Typography component="h1" level="h3">Welcome to StudySynk</Typography>
                {status === "loading" || status === "authenticated" ? (
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress/>
                        <Typography level="body-sm">Setting up your account…</Typography>
                    </Stack>
                ) : (
                    <>
                        <Typography level="body-sm" textAlign="center">
                            Continue with your Google account to get started.
                        </Typography>
                        <Button onClick={() => signIn("google", {callbackUrl: "/"})}>
                            Continue with Google
                        </Button>
                    </>
                )}
            </Stack>
        </Container>
    );
}
