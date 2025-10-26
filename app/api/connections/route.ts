import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getConnectionsFromUser,
  putConnection,
  putUser,
  updateConnection,
  deleteConnection,
} from "@/lib/dynamodb/users";

async function getUserOrUnauthorized() {
  const { userId } = await auth();
  if (!userId) {
    return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId };
}

export async function GET(req: Request) {
  const { errorResponse, userId } = await getUserOrUnauthorized();
  if (errorResponse) return errorResponse;

  try {
    let data = await getConnectionsFromUser(userId);

    if (!data) {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "User session not initialized" }, { status: 401 });
      }

      const rootUserData = {
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
      };

      await putUser(rootUserData);
      data = await getConnectionsFromUser(userId);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET connections error:", err);
    return NextResponse.json(
      { error: "Failed to get connections", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse, userId } = await getUserOrUnauthorized();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName" },
        { status: 400 }
      );
    }

    const connectionData = {
      firstName: body.firstName,
      lastName: body.lastName,
      headshot: body.headshot || null,
      skills: body.skills || [],
      tags: body.tags || [],
      notes: body.notes || "",
      experience: body.experience || [],
      education: body.education || [],
      contacts: body.contacts || [],
    };

    const connection = await putConnection(userId, connectionData);
    return NextResponse.json({ message: "Connection added", connection });
  } catch (err: any) {
    console.error("POST connection error:", err);
    return NextResponse.json(
      { error: "Failed to add connection", details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const { errorResponse, userId } = await getUserOrUnauthorized();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (!body.connectionId) {
      return NextResponse.json(
        { error: "Missing required field: connectionId" },
        { status: 400 }
      );
    }

    const updated = await updateConnection(userId, body.connectionId, body.updates);
    return NextResponse.json({ message: "Connection updated", updated });
  } catch (err: any) {
    console.error("PATCH connection error:", err);
    return NextResponse.json(
      { error: "Failed to update connection", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { errorResponse, userId } = await getUserOrUnauthorized();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const connectionId = url.searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json(
        { error: "Missing query parameter: connectionId" },
        { status: 400 }
      );
    }

    await deleteConnection(userId, connectionId);
    return NextResponse.json({ message: "Connection deleted successfully" });
  } catch (err: any) {
    console.error("DELETE connection error:", err);
    return NextResponse.json(
      { error: "Failed to delete connection", details: err.message },
      { status: 500 }
    );
  }
}
