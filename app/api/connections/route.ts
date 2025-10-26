import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    getConnectionsFromUser,
    putConnection,
    putUser,
    updateConnection,
    deleteConnection,
    getFullUser,
} from "@/lib/dynamodb/users";
import { Person } from "@/types/person";

async function getUserOrGuest() {
    const { userId } = await auth();
    if (!userId) return null;
    return userId;
}

export async function GET() {
    const userId = await getUserOrGuest();

    // Guest mode
    if (!userId) {
        const guestRoot: Person = {
            id: "guest",
            firstName: "Guest",
            lastName: "User",
            headshot: "",
            skills: [],
            tags: [],
            notes: "You are in guest mode. Sign in to save your data.",
            experience: [],
            education: [],
            contacts: [],
            parentId: undefined,
        };
        return NextResponse.json({ warning: "Guest mode: data is not being saved.", root: guestRoot, connections: [] });
    }

    try {
        const rootUserItem = await getFullUser(userId);
        const connections = await getConnectionsFromUser(userId);

        if (!rootUserItem || !rootUserItem.firstName) {
            const user = await currentUser();
            if (!user) {
                const guestRoot: Person = {
                    id: "guest",
                    firstName: "Guest",
                    lastName: "User",
                    headshot: "",
                    skills: [],
                    tags: [],
                    notes: "You are in guest mode. Sign in to save your data.",
                    experience: [],
                    education: [],
                    contacts: [],
                    parentId: undefined,
                };
                return NextResponse.json({ warning: "Guest mode: data is not being saved.", root: guestRoot, connections: [] });
            }

            const rootUserData: Person = {
                id: userId,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                headshot: user.imageUrl || "",
                skills: [],
                tags: [],
                notes: "",
                experience: [],
                education: [],
                contacts: user.emailAddresses[0]?.emailAddress
                    ? [{ type: "email", value: user.emailAddresses[0].emailAddress }]
                    : [],
                parentId: undefined,
            };

            await putUser(rootUserData);
            return NextResponse.json({ root: rootUserData, connections });
        }

        const rootPerson: Person = {
            id: userId,
            firstName: rootUserItem.firstName || "",
            lastName: rootUserItem.lastName || "",
            headshot: rootUserItem.headshot || "",
            skills: rootUserItem.skills || [],
            tags: rootUserItem.tags || [],
            notes: rootUserItem.notes || "",
            experience: rootUserItem.experience || [],
            education: rootUserItem.education || [],
            contacts: rootUserItem.contacts || [],
            parentId: undefined,
        };

        return NextResponse.json({ root: rootPerson, connections });
    } catch (err: unknown) {
        console.error("GET connections error:", err);
        const details = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Failed to get connections", details }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = await getUserOrGuest();
    const body = await req.json();

    // Guest mode
    if (!userId) {
        return NextResponse.json({
            warning: "Guest mode: data is not being saved.",
            message: "Cannot create or save data in guest mode.",
        });
    }

    try {
        // Root user update
        if (body.isRootUser) {
            const user = await currentUser();
            if (!user) {
                return NextResponse.json({ error: "User session not initialized" }, { status: 401 });
            }

            const userData: Person = {
                id: userId,
                firstName: body.firstName ?? user.firstName ?? "",
                lastName: body.lastName ?? user.lastName ?? "",
                headshot: body.headshot ?? user.imageUrl ?? "",
                skills: body.skills ?? [],
                tags: body.tags ?? [],
                notes: body.notes ?? "",
                experience: body.experience ?? [],
                education: body.education ?? [],
                contacts: body.contacts ?? [],
                parentId: undefined,
            };

            const savedUser = await putUser(userData);
            return NextResponse.json({ message: "User saved", user: savedUser });
        }

        // Connection creation
        if (!body.firstName || !body.lastName) {
            return NextResponse.json({ error: "Missing required fields: firstName, lastName" }, { status: 400 });
        }

        const connectionData: Person = {
            id: body.id ?? crypto.randomUUID(),
            firstName: body.firstName,
            lastName: body.lastName,
            headshot: body.headshot ?? null,
            skills: body.skills ?? [],
            tags: body.tags ?? [],
            notes: body.notes ?? "",
            experience: body.experience ?? [],
            education: body.education ?? [],
            contacts: body.contacts ?? [],
            parentId: body.parentId || "root",
        };

        const savedConnection = await putConnection(userId, connectionData);
        return NextResponse.json({ message: "Connection added", connection: savedConnection });
    } catch (err: unknown) {
        console.error("POST connections error:", err);
        const details = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Failed to post connections", details }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const userId = await getUserOrGuest();
    if (!userId) {
        return NextResponse.json({ warning: "Guest mode: cannot update connections." });
    }

    try {
        const body = await req.json();
        if (!body.connectionId) return NextResponse.json({ error: "Missing connectionId" }, { status: 400 });

        const updated = await updateConnection(userId, body.connectionId, body.updates);
        return NextResponse.json({ message: "Connection updated", updated });
    } catch (err: unknown) {
        console.error("PATCH connections error:", err);
        const details = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Failed to update connection", details }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const userId = await getUserOrGuest();
    if (!userId) {
        return NextResponse.json({ warning: "Guest mode: cannot delete connections." });
    }

    try {
        const url = new URL(req.url);
        const connectionId = url.searchParams.get("connectionId");
        if (!connectionId) return NextResponse.json({ error: "Missing connectionId" }, { status: 400 });

        await deleteConnection(userId, connectionId);
        return NextResponse.json({ message: "Connection deleted successfully" });
    } catch (err: unknown) {
        console.error("DELETE connections error:", err);
        const details = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Failed to delete connection", details }, { status: 500 });
    }
}
