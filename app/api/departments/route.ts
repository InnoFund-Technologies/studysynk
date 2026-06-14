import {NextResponse} from "next/server";
import {create, findMany, findOne, pushToArray} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {IDepartment} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    await lower(res, "id");

    // check if Department exists
    const isExist = await findOne<IDepartment>("departments", "name", res.name);
    if (isExist) {
        return NextResponse.json({message: "Department already exists!"});
    }

    // create Department
    const departmentId = await create("departments", {programs: [], ...res});

    // add Department to Faculty document
    await pushToArray("faculties", res.faculty.id, "departments", departmentId);

    return NextResponse.json({message: "Department created successfully!"});
}

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    if (facultyId) {
        const data = await findMany<IDepartment>("departments", {field: "faculty.id", value: facultyId});
        return NextResponse.json(data);
    }
    const data = await findMany<IDepartment>("departments");
    return NextResponse.json(data);
}
