import {NextResponse} from "next/server";
import {create, findMany, findOne, pushToArray} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {ICourse} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    await lower(res, "id");

    const isExist = await findOne<ICourse>("courses", "name", res.name);
    if (isExist) {
        return NextResponse.json({message: "Course already exists!"});
    }

    const courseId = await create("courses", {papers: [], ...res});

    await Promise.all(
        (res.programs as ICourse["programs"]).map((p) =>
            pushToArray("programs", p.programId, "courses", courseId),
        ),
    );

    return NextResponse.json({message: "Course created successfully!"});
}

export async function GET() {
    const data = await findMany<ICourse>("courses");
    return NextResponse.json(data);
}
