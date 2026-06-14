import * as React from "react";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Styled from "@/components/Styled";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";
import {getServerSession} from "next-auth";
import RecentTable from "@/components/home/RecentTable";
import Square3Stack3DIcon from "@heroicons/react/24/outline/Square3Stack3DIcon";
import authOptions from "@/lib/utils/authOptions";

export default async function Home() {
    const session = await getServerSession(authOptions);

    const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.name;

    return (
        <Styled.Section sx={{pt: 4, pb: 12}}>

            <Card
                variant="soft" color="primary" invertedColors
                sx={{
                    boxShadow: 'sm',
                    "--Card-radius": '20px',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                <Box sx={{
                    background: {xs: 'none', md: "url('/home-hero.svg') no-repeat"},
                    backgroundPositionX: {md: 'right'},
                    backgroundPositionY: {md: 'center'},
                    backgroundSize: {md: 240},
                    px: {xs: 1, md: 2},
                    py: {xs: 3, md: 4},
                    minHeight: {xs: 'auto', md: 240},
                }}>
                    <Chip
                        variant="solid"
                        size="lg"
                        startDecorator={<BoltIcon className={"w-5 h-5 ss-icon"}/>}
                        sx={{fontWeight: 600, mb: 2.5}}
                    >
                        {session?.user?.streak ?? 0} day{session?.user?.streak !== 1 && 's'} streak
                    </Chip>
                    <Typography level="body-md" sx={{fontWeight: 500}}>
                        Welcome back 👋
                    </Typography>
                    <Typography
                        level="h2"
                        sx={{mt: 0.5, textTransform: 'capitalize'}}>
                        {firstName}
                    </Typography>
                    <Typography level="body-md" sx={{mt: 2, maxWidth: 460}}>
                        You&apos;re a learning machine! Studying every day increases your retention
                        capacity — keep the streak alive.
                    </Typography>
                </Box>
            </Card>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, pt: 5, pb: 0.5}}>
                <Square3Stack3DIcon className="w-6 h-6 ss-icon"/>
                <Typography level="title-md">Recently shared</Typography>
            </Box>
            <Typography level="body-sm" textColor="text.tertiary" sx={{mb: 1}}>
                Tap a paper to preview it.
            </Typography>
            <RecentTable/>
        </Styled.Section>
    )
}
