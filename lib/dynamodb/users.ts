import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./client";
import { Person } from "@/types/person"
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMO_TABLE!;

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
        type: "PERSON",
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

    for (const exp of (userData.experience ?? [])) {
        const index = (userData.experience ?? []).indexOf(exp);
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

    for (const edu of (userData.education ?? [])) {
        const index = (userData.education ?? []).indexOf(edu);
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

    for (const contact of (userData.contacts ?? [])) {
        const index = (userData.contacts ?? []).indexOf(contact);
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

export async function getConnectionsFromUser(userId: string) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": `ROOT#${userId}`,
            },
        })
    );

    const items = result.Items || [];

    const rootPersonItem = items.find(item => item.type === "PERSON");
    if (!rootPersonItem) return null;

    const connections: any[] = [];
    const connectionsMap: Record<string, any> = {};

    for (const item of items) {
        if (!item.type || !item.type.startsWith("CONNECTION#")) continue;

        const parts = item.type.split("#");
        const connectionId = parts[1];
        const subType = parts[2];

        if (!connectionsMap[connectionId]) {
            connectionsMap[connectionId] = {
                connectionId,
                firstName: item.firstName || "",
                lastName: item.lastName || "",
                jobs: [],
                education: [],
                contacts: [],
                notes: [],
                skills: item.skills || [],
                tags: item.tags || [],
                ...item
            };
        }

        if (!subType) continue;

        if (subType === "JOB") {
            connectionsMap[connectionId].jobs.push(item);
        } else if (subType === "EDU") {
            connectionsMap[connectionId].education.push(item);
        } else if (subType === "CONTACT") {
            connectionsMap[connectionId].contacts.push(item);
        } else if (subType === "NOTE") {
            connectionsMap[connectionId].notes.push(item);
        }
    }

    const connectionsArray = Object.values(connectionsMap);

    return {
        id: rootPersonItem.id,
        firstName: rootPersonItem.firstName || "",
        lastName: rootPersonItem.lastName || "",
        skills: rootPersonItem.skills || [],
        tags: rootPersonItem.tags || [],
        notes: rootPersonItem.notes || "",
        connections: connectionsArray
    };
}

export async function putConnection(userId: string, connectionData: Omit<Person, "id">) {
    const connectionId = uuidv4();

    const item = {
        id: `ROOT#${userId}`,
        type: `CONNECTION#${connectionId}`,
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

    for (const exp of (connectionData.experience ?? [])) {
        const index = (connectionData.experience ?? []).indexOf(exp);
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userId}`,
                    type: `CONNECTION#${connectionId}#EXP#${index}`,
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

    for (const edu of (connectionData.education ?? [])) {
        const index = (connectionData.education ?? []).indexOf(edu);
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userId}`,
                    type: `CONNECTION#${connectionId}#EDU#${index}`,
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

    for (const contact of (connectionData.contacts ?? [])) {
        const index = (connectionData.contacts ?? []).indexOf(contact);
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `ROOT#${userId}`,
                    type: `CONNECTION#${connectionId}#CONTACT#${index}`,
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

export async function updateConnection(userId: string, connectionId: string, updates: Record<string, any>) {
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
                id: `ROOT#${userId}`,
                type: `CONNECTION#${connectionId}`,
            },
            UpdateExpression: "SET " + updateExpressions.join(", "),
            ExpressionAttributeValues: expressionValues,
            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
}

export async function deleteConnection(userId: string, connectionId: string) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :id AND begins_with(#type, :type)",
            ExpressionAttributeNames: {
                "#type": "type"
            },
            ExpressionAttributeValues: {
                ":id": `ROOT#${userId}`,
                ":type": `CONNECTION#${connectionId}`,
            },
        })
    );

    const itemsToDelete = result.Items || [];

    if (itemsToDelete.length === 0) {
        return { message: "Connection not found" };
    }

    const deleteRequests = itemsToDelete.map(item => ({
        DeleteRequest: {
            Key: {
                id: item.id,
                type: item.type
            }
        }
    }));

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