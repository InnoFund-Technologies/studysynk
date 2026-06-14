import {NextResponse} from "next/server";
import {create, findMany, findOne, pushToArray} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {IFaculty} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    await lower(res, "id");

    // check if Faculty exists
    const isExist = await findOne<IFaculty>("faculties", "name", res.name);
    if (isExist) {
        return NextResponse.json({message: "Faculty already exists!"});
    }

    // create Faculty
    const facultyId = await create("faculties", {departments: [], ...res});

    // add Faculty to University document
    await pushToArray("universities", res.university.id, "faculties", facultyId);

    return NextResponse.json({message: "Faculty created successfully!"});
}

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const universityId = searchParams.get("universityId");

    if (universityId) {
        const data = await findMany<IFaculty>("faculties", {field: "university.id", value: universityId});
        return NextResponse.json(data);
    }
    const data = await findMany<IFaculty>("faculties");
    return NextResponse.json(data);
}
