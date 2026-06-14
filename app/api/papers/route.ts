import {NextResponse} from "next/server";
import {create, findById, findMany, pushToArray} from "@/lib/db";
import {IPaper} from "@/lib/types";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
        const data = await findById<IPaper>("papers", id);
        return NextResponse.json(data);
    }
    const data = await findMany<IPaper>("papers");
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const res = (await request.json()) as IPaper;
    const paperId = await create("papers", res as unknown as Record<string, unknown>, true);

    // link the paper onto its course document
    if (res.course?.id) {
        await pushToArray("courses", res.course.id, "papers", paperId);
    }

    return NextResponse.json({message: "Paper submitted for verification!"});
}
