"use client";
import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import Accordion from "@mui/joy/Accordion";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import AccordionDetails from "@mui/joy/AccordionDetails";
import SparklesIcon from "@heroicons/react/24/outline/SparklesIcon";
import AcademicCapIcon from "@heroicons/react/24/outline/AcademicCapIcon";

type Mode = "summary" | "questions";

interface PracticeQuestion {
    question: string;
    answer: string;
}

interface StudyAssistantProps {
    paperId: string;
    title: string;
}

export default function StudyAssistant({paperId, title}: StudyAssistantProps) {
    const [mode, setMode] = React.useState<Mode | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isMock, setIsMock] = React.useState(false);
    const [summary, setSummary] = React.useState<string | null>(null);
    const [questions, setQuestions] = React.useState<PracticeQuestion[] | null>(null);

    const run = async (next: Mode) => {
        setMode(next);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/papers/study", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({paperId, mode: next}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message ?? "Request failed");
            setIsMock(Boolean(data.mock));
            if (next === "summary") {
                setSummary(data.summary ?? "");
                setQuestions(null);
            } else {
                setQuestions(data.questions ?? []);
                setSummary(null);
            }
        } catch (err) {
            console.error(err);
            setError((err as Error).message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography level="title-sm" startDecorator={<SparklesIcon className="w-5 h-5 ss-icon"/>} sx={{mb: 0.5}}>
                Study assistant
            </Typography>
            <Typography level="body-xs" textColor="text.tertiary" sx={{mb: 1.5}}>
                AI help for revising “{title}”.
            </Typography>

            <Box sx={{display: "flex", gap: 1, flexWrap: "wrap"}}>
                <Button
                    size="sm"
                    variant={mode === "summary" ? "solid" : "soft"}
                    loading={loading && mode === "summary"}
                    onClick={() => run("summary")}
                    startDecorator={<SparklesIcon className="w-4 h-4 ss-icon"/>}
                >
                    Summarize
                </Button>
                <Button
                    size="sm"
                    variant={mode === "questions" ? "solid" : "soft"}
                    loading={loading && mode === "questions"}
                    onClick={() => run("questions")}
                    startDecorator={<AcademicCapIcon className="w-4 h-4 ss-icon"/>}
                >
                    Practice questions
                </Button>
            </Box>

            {isMock && !loading && (summary !== null || questions !== null) && (
                <Chip size="sm" color="warning" variant="soft" sx={{mt: 1.5}}>
                    Demo output — set ANTHROPIC_API_KEY to enable
                </Chip>
            )}

            {error && (
                <Typography level="body-sm" color="danger" sx={{mt: 1.5}}>
                    {error}
                </Typography>
            )}

            {summary !== null && !loading && (
                <Sheet variant="soft" sx={{mt: 1.5, p: 2, borderRadius: "md", whiteSpace: "pre-wrap"}}>
                    <Typography level="body-sm">{summary}</Typography>
                </Sheet>
            )}

            {questions !== null && !loading && (
                <AccordionGroup sx={{mt: 1.5, "--ListItem-paddingX": "8px"}}>
                    {questions.length === 0 ? (
                        <Typography level="body-sm" textColor="text.tertiary">No questions generated.</Typography>
                    ) : (
                        questions.map((q, i) => (
                            <Accordion key={i}>
                                <AccordionSummary>
                                    <Typography level="body-sm">{i + 1}. {q.question}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography level="body-sm" textColor="text.secondary">{q.answer}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </AccordionGroup>
            )}
        </Box>
    );
}
