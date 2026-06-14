import {NextResponse} from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {findById} from "@/lib/db";
import {IPaper} from "@/lib/types";

export const maxDuration = 60;

type Mode = "summary" | "questions";

interface StudyRequest {
    paperId: string;
    mode: Mode;
}

const MODEL = "claude-opus-4-8";

// Schema constrains the practice-questions response to valid, parseable JSON.
const QUESTIONS_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        questions: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    question: {type: "string"},
                    answer: {type: "string"},
                },
                required: ["question", "answer"],
            },
        },
    },
    required: ["questions"],
} as const;

function mockResponse(mode: Mode, paper: IPaper) {
    const courseName = Array.isArray(paper.course?.name) ? paper.course.name[0] : paper.course?.name;
    if (mode === "summary") {
        return {
            mode,
            mock: true,
            summary:
                `This is a sample summary (AI is not configured — set ANTHROPIC_API_KEY to enable it).\n\n` +
                `“${paper.title}” is a ${paper.year ?? ""} ${paper.paperType ?? "paper"} for ` +
                `${courseName ?? "the course"} at ${paper.university?.code?.toUpperCase() ?? "the university"}. ` +
                `Once configured, this panel will summarise the key topics and likely exam themes from the paper itself.`,
        };
    }
    return {
        mode,
        mock: true,
        questions: [
            {
                question: "Sample practice question — set ANTHROPIC_API_KEY to generate real ones from this paper.",
                answer: "When configured, each answer will be derived from the paper's content.",
            },
        ],
    };
}

const PROMPTS: Record<Mode, string> = {
    summary:
        "You are a study assistant. Read the attached past exam paper and write a concise summary for a student " +
        "revising for this course: the main topics it covers, the question styles used, and the themes most worth " +
        "revising. Use short paragraphs and bullet points. Do not invent content that isn't in the paper.",
    questions:
        "You are a study assistant. Based on the attached past exam paper, generate 5 original practice questions " +
        "in the same style and difficulty, each with a concise model answer. Base them on the paper's topics; do " +
        "not copy questions verbatim.",
};

export async function POST(request: Request) {
    let body: StudyRequest;
    try {
        body = (await request.json()) as StudyRequest;
    } catch {
        return NextResponse.json({message: "Invalid request body."}, {status: 400});
    }

    const {paperId, mode} = body;
    if (!paperId || (mode !== "summary" && mode !== "questions")) {
        return NextResponse.json({message: "paperId and a valid mode are required."}, {status: 400});
    }

    const paper = await findById<IPaper>("papers", paperId);
    if (!paper) {
        return NextResponse.json({message: "Paper not found."}, {status: 404});
    }

    // Graceful fallback so the feature ships and demos without a key.
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(mockResponse(mode, paper));
    }

    const client = new Anthropic();

    const content: Anthropic.ContentBlockParam[] = [{type: "text", text: PROMPTS[mode]}];
    if (paper.url) {
        content.unshift({
            type: "document",
            source: {type: "url", url: paper.url},
        });
    }

    try {
        if (mode === "questions") {
            const message = await client.messages.create({
                model: MODEL,
                max_tokens: 4096,
                thinking: {type: "adaptive"},
                output_config: {format: {type: "json_schema", schema: QUESTIONS_SCHEMA}},
                messages: [{role: "user", content}],
            });
            const text = message.content.find((b) => b.type === "text");
            const parsed = text && text.type === "text" ? JSON.parse(text.text) : {questions: []};
            return NextResponse.json({mode, mock: false, questions: parsed.questions ?? []});
        }

        const message = await client.messages.create({
            model: MODEL,
            max_tokens: 2048,
            thinking: {type: "adaptive"},
            messages: [{role: "user", content}],
        });
        const summary = message.content
            .filter((b): b is Anthropic.TextBlock => b.type === "text")
            .map((b) => b.text)
            .join("\n")
            .trim();
        return NextResponse.json({mode, mock: false, summary});
    } catch (error) {
        console.error("Study assistant error:", error);

        // Surface configuration problems (bad key, no credits, lack of access)
        // clearly instead of a generic "try again" — retrying won't help.
        if (error instanceof Anthropic.APIError) {
            const detail = String(error.message ?? "");
            if (
                error.status === 401 ||
                error.status === 403 ||
                /credit balance|billing|too low/i.test(detail)
            ) {
                return NextResponse.json(
                    {message: "AI is not available — the API account needs credits or access. Ask an admin to check Anthropic billing."},
                    {status: 503},
                );
            }
            if (error.status === 429) {
                return NextResponse.json(
                    {message: "The study assistant is busy right now. Please try again in a moment."},
                    {status: 429},
                );
            }
        }

        return NextResponse.json(
            {message: "The study assistant is unavailable right now. Please try again."},
            {status: 502},
        );
    }
}
