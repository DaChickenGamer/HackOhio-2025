import { NextResponse } from "next/server";
import { getUser, putUser } from "@/lib/dynamodb/users";

export async function GET(req: Request) {
    const user = await getUser("123");
    return NextResponse.json(user);
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        if (!body.userId || !body.firstName || !body.lastName) {
            return NextResponse.json(
                { error: "Missing required fields: userId, firstName, lastName" },
                { status: 400 }
            );
        }

        const newUser = await putUser(body);

        return NextResponse.json(
            { message: "User saved successfully", user: newUser },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Error saving user:", err);
        return NextResponse.json(
            { error: "Failed to save user", details: err.message },
            { status: 500 }
        );
    }
}
