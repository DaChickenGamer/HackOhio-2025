import { GetCommand, PutCommand, UpdateCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./client";
import { Person } from "@/types/person";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMO_TABLE!;
const CONNECTIONS_GSI = "userId-index";

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
    const pk = `CONNECTION#${connectionId}`;

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
/**
 * Fetches all connections for a user using the GSI.
 * This is highly efficient as it queries only the user's data partition.
 * 
 * Required GSI configuration:
 * - Name: userId-index
 * - Partition Key: userId (String)
 * - Sort Key: type (String)
 */
export async function getConnectionsFromUser(userId: string) {
    let result;
    try {
        result = await ddb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: CONNECTIONS_GSI,
                KeyConditionExpression: "userId = :userId",
                FilterExpression: "begins_with(id, :connectionPrefix)",
                ExpressionAttributeValues: {
                    ":userId": userId,
                    ":connectionPrefix": "CONNECTION#",
                },
            })
        );
    } catch (error: any) {
        if (error.name === "ValidationException" && error.message?.includes("index")) {
            console.error(`GSI '${CONNECTIONS_GSI}' may not exist. Please create it with: userId (partition key), type (sort key)`);
        }
        throw error;
    }

    const items = result.Items ?? [];
    const connectionsMap: Record<string, any> = {};

    // First pass: collect PERSON# items to create connection entries
    for (const item of items) {
        if (item.type.startsWith("PERSON#") && item.connectionId) {
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

    // Second pass: collect nested items (EXP#, EDU#, CONTACT#)
    for (const item of items) {
        const connectionId = item.connectionId;
        if (!connectionsMap[connectionId]) continue;

        if (item.type.startsWith("EXP#")) {
            connectionsMap[connectionId].experience.push(item);
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
    const pk = `CONNECTION#${connectionId}`;
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
    
    // Add userId for the condition expression
    expressionValues[":userId"] = userId;

    const result = await ddb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                id: pk,
                type: `PERSON#${connectionId}`,
            },
            UpdateExpression: "SET " + updateExpressions.join(", "),
            ConditionExpression: "userId = :userId",
            ExpressionAttributeValues: expressionValues,
            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
}

// -------------------- DELETE CONNECTION --------------------
export async function deleteConnection(userId: string, connectionId: string) {
    const pk = `CONNECTION#${connectionId}`;

    // Query all items for this connection
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :pk",
            ExpressionAttributeValues: {
                ":pk": pk,
            },
        })
    );

    const itemsToDelete = result.Items ?? [];

    if (itemsToDelete.length === 0) {
        return { message: "Connection not found" };
    }

    // Verify ownership - ensure all items belong to this user
    const unauthorizedItems = itemsToDelete.filter(item => item.userId !== userId);
    if (unauthorizedItems.length > 0) {
        return { message: "Unauthorized: Connection does not belong to this user" };
    }

    // Prepare batch delete requests
    const deleteRequests = itemsToDelete.map(item => ({
        DeleteRequest: { 
            Key: { 
                id: item.id, 
                type: item.type 
            } 
        },
    }));

    // DynamoDB batch limit = 25 items per batch
    for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await ddb.send(
            new BatchWriteCommand({ 
                RequestItems: { 
                    [TABLE_NAME]: batch 
                } 
            })
        );
    }

    return { message: "Connection and all related items deleted successfully" };
}
