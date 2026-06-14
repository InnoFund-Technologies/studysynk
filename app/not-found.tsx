import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Styled from "@/components/Styled";

export default function NotFound() {
    return (
        <Styled.Section
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "calc(100vh - 64px)",
                px: 2,
                py: 8,
            }}
        >
            <Styled.Header sx={{fontSize: {xs: "3.5rem", md: "5rem"}}}>404</Styled.Header>
            <Typography level="h4" sx={{mb: 1}}>
                Page not found
            </Typography>
            <Typography level="body-md" textColor="text.secondary" sx={{maxWidth: 440, mb: 3}}>
                The page you’re looking for doesn’t exist or may have been moved.
            </Typography>
            <Box sx={{display: "flex", gap: 1.5}}>
                <Button variant="soft" component="a" href="/" sx={{fontWeight: 500}}>
                    Go home
                </Button>
                <Button variant="plain" color="neutral" component="a" href="/papers">
                    Browse papers
                </Button>
            </Box>
        </Styled.Section>
    );
}
