import {NextResponse} from "next/server";
import {findOne, update} from "@/lib/db";
import {IStudent} from "@/lib/types";

export async function POST(request: Request) {
    const res = await request.json();
    const student = await findOne<IStudent>("students", "email", res.email);

    if (!student) {
        return NextResponse.json({message: "Account not found!"}, {status: 404});
    }

    await update("students", student._id, {
        bio: res.bio,
        university: res.university,
        faculty: res.faculty,
        department: res.department,
        program: res.program,
    });

    return NextResponse.json({message: "Profile updated successfully!"});
}
