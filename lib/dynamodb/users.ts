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
                PK: `ROOT#${userId}`,
                SK: `PERSON#${userId}`,
            },
        })
    );
    return result.Item;
}

export async function putUser(userData: Person) {
    const item = {
        id: userData.id,
        type: "Root",
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
                    id: `${userData.id}#EXP#${index}`,
                    type: "Experience",
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
                    id: `${userData.id}#EDU#${index}`, // unique id for each education
                    type: "Education",
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
                    id: `${userData.id}#CONTACT#${index}`, // unique id for each contact
                    type: "Contact",
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
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `ROOT#${userId}`,
            },
        })
    );

    const items = result.Items || [];

    const rootPersonItem = items.find(item => item.SK === `PERSON#${userId}`);
    if (!rootPersonItem) return null;

    const connections: any[] = [];

    const connectionsMap: Record<string, any> = {};

    for (const item of items) {
        if (!item.SK.startsWith("CONNECTION#")) continue;

        const parts = item.SK.split("#");
        const connectionId = parts[1];
        const type = parts[2];

        if (!connectionsMap[connectionId]) {
            connectionsMap[connectionId] = {
                connectionId,
                jobs: [],
                education: [],
                contacts: [],
                notes: [],
                ...item
            };
        }

        if (!type) continue;

        if (type === "JOB") {
            connectionsMap[connectionId].jobs.push(item);
        } else if (type === "EDU") {
            connectionsMap[connectionId].education.push(item);
        } else if (type === "CONTACT") {
            connectionsMap[connectionId].contacts.push(item);
        } else if (type === "NOTE") {
            connectionsMap[connectionId].notes.push(item);
        }
    }

    const connectionsArray = Object.values(connectionsMap);

    return {
        ...rootPersonItem,
        connections: connectionsArray
    };
}

export async function putConnection(userId: string, connectionData: Omit<Person, "id">) {
    const connectionId = uuidv4();

    const item = {
        id: `${userId}#CONNECTION#${connectionId}`,
        type: "Connection",
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
                    id: `${userId}#CONNECTION#${connectionId}#EXP#${index}`,
                    type: "Experience",
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
                    id: `${userId}#CONNECTION#${connectionId}#EDU#${index}`,
                    type: "Education",
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
                    id: `${userId}#CONNECTION#${connectionId}#CONTACT#${index}`,
                    type: "Contact",
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
                PK: `ROOT#${userId}`,
                SK: `CONNECTION#${connectionId}`,
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
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": `ROOT#${userId}`,
                ":sk": `CONNECTION#${connectionId}`,
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
                PK: item.PK,
                SK: item.SK
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