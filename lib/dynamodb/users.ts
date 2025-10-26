import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./client";
import { Person } from "@/types/person";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMO_TABLE!;

// -------------------- USER --------------------
export async function getUser(userId: string) {
    const result = await ddb.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                id: `ROOT#${userId}`,
                type: `PERSON#${userId}`,
            },
        })
    );
    return result.Item;
}

export async function putUser(userData: Person) {
    const item = {
        id: `ROOT#${userData.id}`,
        type: `PERSON#${userData.id}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.headshot ?? null,
        skills: userData.skills ?? [],
        tags: userData.tags ?? [],
        notes: userData.notes ?? "",
        updatedAt: new Date().toISOString(),
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        })
    );

    for (const [index, exp] of (userData.experience ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userData.id}`,
                    type: `EXP#${index}`,
                    role: exp.role,
                    company: exp.company,
                    duration: exp.duration ?? "",
                    userId: userData.id,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    for (const [index, edu] of (userData.education ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userData.id}`,
                    type: `EDU#${index}`,
                    degree: edu.degree,
                    school: edu.school,
                    year: edu.year ?? "",
                    userId: userData.id,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    for (const [index, contact] of (userData.contacts ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userData.id}`,
                    type: `CONTACT#${index}`,
                    contactType: contact.type,
                    value: contact.value,
                    userId: userData.id,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    return item;
}

// -------------------- CONNECTIONS --------------------
export async function putConnection(userId: string, connectionData: Omit<Person, "id">) {
    const connectionId = uuidv4();
    const pk = `ROOT#${userId}#CONNECTION#${connectionId}`;

    // Root connection item
    const item = {
        id: pk,
        type: `PERSON#${connectionId}`,
        userId,
        connectionId,
        firstName: connectionData.firstName,
        lastName: connectionData.lastName,
        picture: connectionData.headshot ?? null,
        skills: connectionData.skills ?? [],
        tags: connectionData.tags ?? [],
        notes: connectionData.notes ?? "",
        updatedAt: new Date().toISOString(),
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        })
    );

    // Experience
    for (const [index, exp] of (connectionData.experience ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: pk,
                    type: `EXP#${index}`,
                    role: exp.role,
                    company: exp.company,
                    duration: exp.duration ?? "",
                    userId,
                    connectionId,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    // Education
    for (const [index, edu] of (connectionData.education ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: pk,
                    type: `EDU#${index}`,
                    degree: edu.degree,
                    school: edu.school,
                    year: edu.year ?? "",
                    userId,
                    connectionId,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    // Contacts
    for (const [index, contact] of (connectionData.contacts ?? []).entries()) {
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: pk,
                    type: `CONTACT#${index}`,
                    contactType: contact.type,
                    value: contact.value,
                    userId,
                    connectionId,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    }

    return { ...item, connectionId };
}

// -------------------- GET CONNECTIONS --------------------
export async function getConnectionsFromUser(userId: string) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "begins_with(id, :pk)",
            ExpressionAttributeValues: {
                ":pk": `ROOT#${userId}#CONNECTION#`,
            },
        })
    );

    const items = result.Items || [];
    const connectionsMap: Record<string, any> = {};

    for (const item of items) {
        const connectionId = item.connectionId;
        if (!connectionsMap[connectionId]) {
            connectionsMap[connectionId] = {
                connectionId,
                firstName: item.firstName || "",
                lastName: item.lastName || "",
                skills: item.skills || [],
                tags: item.tags || [],
                notes: item.notes || "",
                jobs: [],
                education: [],
                contacts: [],
            };
        }

        if (item.type.startsWith("EXP#")) {
            connectionsMap[connectionId].jobs.push(item);
        } else if (item.type.startsWith("EDU#")) {
            connectionsMap[connectionId].education.push(item);
        } else if (item.type.startsWith("CONTACT#")) {
            connectionsMap[connectionId].contacts.push(item);
        }
    }

    return Object.values(connectionsMap);
}

// -------------------- UPDATE CONNECTION --------------------
export async function updateConnection(userId: string, connectionId: string, updates: Record<string, any>) {
    const pk = `ROOT#${userId}#CONNECTION#${connectionId}`;

    const updateExpressions: string[] = [];
    const expressionValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, idx) => {
        const placeholder = `:val${idx}`;
        updateExpressions.push(`${key} = ${placeholder}`);
        expressionValues[placeholder] = updates[key];
    });

    updateExpressions.push("updatedAt = :updatedAt");
    expressionValues[":updatedAt"] = new Date().toISOString();

    const result = await ddb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                id: pk,
                type: `PERSON#${connectionId}`,
            },
            UpdateExpression: "SET " + updateExpressions.join(", "),
            ExpressionAttributeValues: expressionValues,
            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
}

// -------------------- DELETE CONNECTION --------------------
export async function deleteConnection(userId: string, connectionId: string) {
    const pk = `ROOT#${userId}#CONNECTION#${connectionId}`;

    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": pk,
            },
        })
    );

    const itemsToDelete = result.Items || [];

    if (itemsToDelete.length === 0) {
        return { message: "Connection not found" };
    }

    const deleteRequests = itemsToDelete.map(item => ({
        DeleteRequest: { Key: { id: item.id, type: item.type } }
    }));

    for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await ddb.send(
            new BatchWriteCommand({ RequestItems: { [TABLE_NAME]: batch } })
        );
    }

    return { message: "Connection and all related items deleted successfully" };
}
