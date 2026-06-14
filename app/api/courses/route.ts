import {NextResponse} from "next/server";
import {create, findMany, findOne, pushToArray} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {ICourse} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    await lower(res, "id");

    // The form submits a `names` array; a course is a duplicate if any of its
    // names already exists on a course document.
    const firstName = (res.names as string[] | undefined)?.[0];
    if (!firstName) {
        return NextResponse.json(
            {message: "Course name is required!"},
            {status: 400},
        );
    }

    const isExist = await findOne<ICourse>(
        "courses",
        "names",
        firstName,
        "array-contains",
    );
    if (isExist) {
        return NextResponse.json({message: "Course already exists!"});
    }

    const courseId = await create("courses", {papers: [], ...res});

    const results = await Promise.all(
        (res.programs as ICourse["programs"]).map((p) =>
            pushToArray("programs", p.programId, "courses", courseId),
        ),
    );

    const missing = results.filter((applied) => !applied).length;
    if (missing > 0) {
        console.warn(
            `Course ${courseId} created, but ${missing} referenced program(s) were not found.`,
        );
    }

    return NextResponse.json({message: "Course created successfully!"});
}

export async function GET() {
    const data = await findMany<ICourse>("courses");
    return NextResponse.json(data);
}
