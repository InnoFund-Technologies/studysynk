"use client";

import * as React from 'react';
import {useState} from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormLabel, {formLabelClasses} from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import SvgIcon from '@mui/joy/SvgIcon';
import IconButton from "@mui/joy/IconButton";
import DocumentMagnifyingGlassIcon from "@heroicons/react/24/solid/DocumentMagnifyingGlassIcon";
import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {ToastContainer} from "react-toastify";

export default function SignIn() {
    const session = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn("google", {callbackUrl: "/"});
    }

    if (!session) {
        return router.replace('/')
    }

    return (
        <>
            <Box
                sx={(theme) => ({
                    width:
                        'clamp(100vw - var(--Cover-width), (var(--Collapsed-breakpoint) - 100vw) * 999, 100vw)',
                    transition: 'width var(--Transition-duration)',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(255 255 255 / 0.6)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundColor: {
                            xs: 'rgb(14 14 16 / 0.7)',
                            md: 'rgb(14 14 16)'
                        },
                    },
                })}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100dvh',
                        width:
                            'clamp(var(--Form-maxWidth), (var(--Collapsed-breakpoint) - 100vw) * 999, 100%)',
                        maxWidth: '100%',
                        px: 2,
                    }}
                >
                    <Box
                        component="header"
                        sx={{
                            py: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography
                            component="h1" fontWeight="xl"
                            startDecorator={
                                <IconButton
                                    size="sm"
                                    variant="soft"
                                    sx={{
                                        display: 'inline-flex', width: 35,
                                        height: 35
                                    }}
                                >
                                    <DocumentMagnifyingGlassIcon className="w-6 h-6 ss-icon"/>
                                </IconButton>
                            }
                        >
                            StudySynk
                        </Typography>
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            my: {xs: 4, md: 'auto'},
                            py: 2,
                            pb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: 400,
                            maxWidth: '100%',
                            mx: 'auto',
                            borderRadius: 'sm',
                            '& form': {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            },
                            [`& .${formLabelClasses.asterisk}`]: {
                                visibility: 'hidden',
                            },
                        }}
                    >
                        <div>
                            <Typography component="h1" fontSize="xl2" fontWeight="lg">
                                Sign in to your account
                            </Typography>
                            <Typography level="body-sm" sx={{my: 1, mb: 3}}>
                                Welcome back. Continue with your Google account.
                            </Typography>
                        </div>

                        <Button
                            variant="outlined"
                            color="neutral"
                            fullWidth
                            loading={loading}
                            onClick={handleGoogleSignIn}
                            startDecorator={
                                <SvgIcon fontSize="xl">
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                        <path
                                            fill="#4285F4"
                                            d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                                        />
                                    </g>
                                </SvgIcon>
                            }
                        >
                            Sign in with Google
                        </Button>
                    </Box>
                    <Box component="footer" sx={{py: 3}}>
                        <Typography level="body-xs" textAlign="center">
                            © StudySynk {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={(theme) => ({
                    height: '100%',
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    left: 'clamp(0px, (100vw - var(--Collapsed-breakpoint)) * 999, 100vw - var(--Cover-width))',
                    transition:
                        'background-image var(--Transition-duration), left var(--Transition-duration) !important',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    backgroundColor: 'transparent',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage: 'url("/signup-hero-1.jpg")',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundImage: 'url("/signup-hero-2.svg")',
                    },
                })}
            />
            <ToastContainer/>
        </>
    );
}
