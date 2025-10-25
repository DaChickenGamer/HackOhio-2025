import { NextResponse } from "next/server";
import {
    getConnectionsFromUser,
    putConnection,
    updateConnection,
    deleteConnection,
} from "@/lib/dynamodb/users";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    try {
        const person = await getConnectionsFromUser(id);
        return NextResponse.json(person);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to get connections", details: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "Missing required fields: userId post"},
                { status: 400 }
            );
        }

        const connection = await putConnection(body.id, body);
        return NextResponse.json({ message: "Connection added", connection });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to add connection", details: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "Missing required userid updates" },
                { status: 400 }
            );
        }

        const updated = await updateConnection(body.userId, body.connectionId, body.updates);
        return NextResponse.json({ message: "Connection updated", updated });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to update connection", details: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        const connectionId = url.searchParams.get("connectionId");

        if (!id || !connectionId) {
            return NextResponse.json(
                { error: "Missing query parameters: id, connectionId" },
                { status: 400 }
            );
        }

        await deleteConnection(id, connectionId);
        return NextResponse.json({ message: "Connection deleted successfully" });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to delete connection", details: err.message }, { status: 500 });
    }
}
