import {NextResponse} from "next/server";
import {create, findById, findMany, findOne} from "@/lib/db";
import {lower} from "@/lib/utils/helper";
import {IUniversity} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();

    const isExist = await findOne<IUniversity>("universities", "name", res.name);
    if (isExist) {
        return NextResponse.json({message: "University already exists!"});
    }
    await lower(res);
    await create("universities", {faculties: [], ...res});
    return NextResponse.json({message: "University created successfully!"});
}

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
        const data = await findById<IUniversity>("universities", id);
        return NextResponse.json(data);
    }
    const data = await findMany<IUniversity>("universities");
    return NextResponse.json(data);
}
