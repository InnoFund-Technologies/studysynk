import {NextResponse} from "next/server";
import {create, findMany, findOne, pushToArray} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {IProgram} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    await lower(res, "departmentId");

    // check if Program exists
    const isExist = await findOne<IProgram>("programs", "name", res.name);
    if (isExist) {
        return NextResponse.json({message: "Program already exists!"});
    }

    // create Program
    const programId = await create("programs", {courses: [], ...res});

    // add Program to Department document
    await pushToArray("departments", res.department.id, "programs", programId);

    return NextResponse.json({message: "Program created successfully!"});
}

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    if (departmentId) {
        const data = await findMany<IProgram>("programs", {field: "department.id", value: departmentId});
        return NextResponse.json(data);
    }
    const data = await findMany<IProgram>("programs");
    return NextResponse.json(data);
}
