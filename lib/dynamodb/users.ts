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
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.experience.push(cleanItem);
    } else if (item.type.startsWith("EDU#")) {
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.education.push(cleanItem);
    } else if (item.type.startsWith("CONTACT#")) {
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.contacts.push(cleanItem);
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

  const putNested = async (items: any[], prefix: string) => {
    for (const item of items ?? []) {
      const nestedId = uuidv4();
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: `ROOT#${userData.id}`,
            type: `${prefix}#${nestedId}`,
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
  
    // main connection item
    const connectionItem = {
      id: `CONNECTION#${connectionId}`,
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
  
    // helper to create nested items as separate PKs
    const putNested = async (items: any[], prefix: string) => {
      for (const item of items ?? []) {
        const nestedId = uuidv4();
        await ddb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              id: `${prefix}#${nestedId}`, // NEW PK for each nested item
              type: `${prefix}#${nestedId}`,
              connectionId,
              userId,
              updatedAt: now,
              ...item,
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
  // Step 1: get all connections for user
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: CONNECTIONS_GSI,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    })
  );

  const items = result.Items ?? [];
  const connectionsMap: Record<string, any> = {};

  for (const item of items) {
    const connectionId = item.connectionId;
    if (!connectionId) continue;

    if (!connectionsMap[connectionId]) {
      connectionsMap[connectionId] = {
        id: connectionId,
        firstName: "",
        lastName: "",
        headshot: "",
        skills: [],
        tags: [],
        notes: "",
        experience: [],
        education: [],
        contacts: [],
      };
    }

    const entry = connectionsMap[connectionId];

    if (item.type.startsWith("PERSON#")) {
      entry.firstName = item.firstName ?? "";
      entry.lastName = item.lastName ?? "";
      entry.headshot = item.picture ?? "";
      entry.skills = item.skills ?? [];
      entry.tags = item.tags ?? [];
      entry.notes = item.notes ?? "";
    } else if (item.type.startsWith("EXP#")) {
      const { id, type, userId: _, connectionId: __, updatedAt, ...cleanItem } = item;
      entry.experience.push(cleanItem);
    } else if (item.type.startsWith("EDU#")) {
      const { id, type, userId: _, connectionId: __, updatedAt, ...cleanItem } = item;
      entry.education.push(cleanItem);
    } else if (item.type.startsWith("CONTACT#")) {
      const { id, type, userId: _, connectionId: __, updatedAt, ...cleanItem } = item;
      entry.contacts.push(cleanItem);
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
  expressionValues[":userId"] = userId;

  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: pk, type: `PERSON#${connectionId}` },
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

  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "id = :pk",
      ExpressionAttributeValues: { ":pk": pk },
    })
  );

  const itemsToDelete = result.Items ?? [];
  if (itemsToDelete.some(item => item.userId !== userId)) {
    return { message: "Unauthorized: Connection does not belong to this user" };
  }

  const deleteRequests = itemsToDelete.map(item => ({
    DeleteRequest: { Key: { id: item.id, type: item.type } },
  }));

  for (let i = 0; i < deleteRequests.length; i += 25) {
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: deleteRequests.slice(i, i + 25) },
      })
    );
  }

  return { message: "Connection and all related items deleted successfully" };
}
