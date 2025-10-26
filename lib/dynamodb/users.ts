import { GetCommand, PutCommand, UpdateCommand, QueryCommand, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
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

export async function getFullUser(userId: string) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :pk",
            ExpressionAttributeValues: {
                ":pk": `ROOT#${userId}`,
            },
        })
    );
    
    const items = result.Items ?? [];
    const userData: any = {
        experience: [],
        education: [],
        contacts: [],
    };
    
    for (const item of items) {
        if (item.type === `PERSON#${userId}`) {
            userData.firstName = item.firstName;
            userData.lastName = item.lastName;
            userData.picture = item.picture;
            userData.skills = item.skills;
            userData.tags = item.tags;
            userData.notes = item.notes;
        } else if (item.type.startsWith("EXP#")) {
            userData.experience.push(item);
        } else if (item.type.startsWith("EDU#")) {
            userData.education.push(item);
        } else if (item.type.startsWith("CONTACT#")) {
            userData.contacts.push(item);
        }
    }
    
    return userData;
}

export async function putUser(userData: Person) {
    const now = new Date().toISOString();
    const userItem = {
        id: `ROOT#${userData.id}`,
        type: `PERSON#${userData.id}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.headshot ?? null,
        skills: userData.skills ?? [],
        tags: userData.tags ?? [],
        notes: userData.notes ?? "",
        updatedAt: now,
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: userItem,
        })
    );

    // Nested items: experience, education, contacts
    const putNested = async (items: any[], prefix: string) => {
        for (const [index, item] of (items ?? []).entries()) {
            await ddb.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: {
                        id: `ROOT#${userData.id}`,
                        type: `${prefix}#${index}`,
                        ...item,
                        userId: userData.id,
                        updatedAt: now,
                    },
                })
            );
        }
    };

    await putNested(userData.experience ?? [], "EXP");
    await putNested(userData.education ?? [], "EDU");
    await putNested(userData.contacts ?? [], "CONTACT");
    

    return userItem;
}

// -------------------- CONNECTIONS --------------------
export async function putConnection(userId: string, connectionData: Omit<Person, "id">) {
    const connectionId = uuidv4();
    const now = new Date().toISOString();
    const pk = `ROOT#${userId}#CONNECTION#${connectionId}`;

    // Root connection item
    const connectionItem = {
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
        updatedAt: now,
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: connectionItem,
        })
    );

    const putNested = async (items: any[], prefix: string) => {
        for (const [index, item] of (items ?? []).entries()) {
            await ddb.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: {
                        id: pk,
                        type: `${prefix}#${index}`,
                        ...item,
                        userId,
                        connectionId,
                        updatedAt: now,
                    },
                })
            );
        }
    };

    await putNested(connectionData.experience ?? [], "EXP");
    await putNested(connectionData.education ?? [], "EDU");
    await putNested(connectionData.contacts ?? [], "CONTACT");
    

    return { ...connectionItem, connectionId };
}

// -------------------- GET CONNECTIONS --------------------
export async function getConnectionsFromUser(userId: string) {
    const result = await ddb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
      );

    const items = result.Items ?? [];
    const connectionsMap: Record<string, any> = {};

    // First pass: collect PERSON# items to create connection entries
    for (const item of items) {
        if (item.type && item.type.startsWith("PERSON#")) {
            const connectionId = item.connectionId;
            if (!connectionsMap[connectionId]) {
                connectionsMap[connectionId] = {
                    id: connectionId,
                    firstName: item.firstName ?? "",
                    lastName: item.lastName ?? "",
                    headshot: item.picture ?? "",
                    skills: item.skills ?? [],
                    tags: item.tags ?? [],
                    notes: item.notes ?? "",
                    experience: [],
                    education: [],
                    contacts: [],
                };
            }
        }
    }

    // Second pass: collect nested items
    for (const item of items) {
        const connectionId = item.connectionId;
        if (!connectionsMap[connectionId]) continue; // Skip if no main connection entry

        if (item.type && item.type.startsWith("EXP#")) {
            connectionsMap[connectionId].experience.push(item);
        } else if (item.type && item.type.startsWith("EDU#")) {
            connectionsMap[connectionId].education.push(item);
        } else if (item.type && item.type.startsWith("CONTACT#")) {
            connectionsMap[connectionId].contacts.push(item);
        }
    }

    return Object.values(connectionsMap);
}

// -------------------- UPDATE CONNECTION --------------------
export async function updateConnection(userId: string, connectionId: string, updates: Record<string, any>) {
    const pk = `ROOT#${userId}#CONNECTION#${connectionId}`;
    const now = new Date().toISOString();

    const updateExpressions: string[] = [];
    const expressionValues: Record<string, any> = {};


    Object.entries(updates).forEach(([key, value], idx) => {
        const placeholder = `:val${idx}`;
        updateExpressions.push(`${key} = ${placeholder}`);
        expressionValues[placeholder] = value;
    });

    updateExpressions.push("updatedAt = :updatedAt");
    expressionValues[":updatedAt"] = now;

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
          KeyConditionExpression: "id = :id AND begins_with(#type, :prefix)",
          ExpressionAttributeNames: { "#type": "type" },
          ExpressionAttributeValues: {
            ":id": `ROOT#${userId}#CONNECTION#${connectionId}`,
            ":prefix": "EXP#", // or EDU#, CONTACT#
          },
        })
      );

    const itemsToDelete = result.Items ?? [];

    if (itemsToDelete.length === 0) {
        return { message: "Connection not found" };
    }

    const deleteRequests = itemsToDelete.map(item => ({
        DeleteRequest: { Key: { id: item.id, type: item.type } },
    }));

    // DynamoDB batch limit = 25
    for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await ddb.send(
            new BatchWriteCommand({ RequestItems: { [TABLE_NAME]: batch } })
        );
    }

    return { message: "Connection and all related items deleted successfully" };
}
