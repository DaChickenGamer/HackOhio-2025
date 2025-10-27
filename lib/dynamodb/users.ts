import { GetCommand, PutCommand, UpdateCommand, QueryCommand, BatchWriteCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./client";
import { Person } from "@/types/person";
import { v4 as uuidv4 } from "uuid";
import { Experience } from "@/types/experience";
import { Education } from "@/types/education";
import { Contact } from "@/types/contact";

const TABLE_NAME = process.env.DYNAMO_TABLE!;
const CONNECTIONS_GSI = "userId-index";

type NestedItem = Experience | Education | Contact;

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

  type FullUserData = Omit<Person, "id"> & {
    experience: Array<Experience>;
    education: Array<Education>;
    contacts: Array<Contact>;
  };

  const items = result.Items ?? [];

const userData: FullUserData = {
  headshot: "",       
  firstName: "",     
  experience: [],     
  education: [],    
  contacts: [], 
};

  for (const item of items) {
    if (item.type === `PERSON#${userId}`) {
      userData.firstName = item.firstName;
      userData.lastName = item.lastName;
      userData.headshot = item.picture
      userData.skills = item.skills;
      userData.tags = item.tags;
      userData.notes = item.notes;
    } else if (item.type.startsWith("EXP#")) {
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.experience.push(cleanItem as Experience);
    } else if (item.type.startsWith("EDU#")) {
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.education.push(cleanItem as Education);
    } else if (item.type.startsWith("CONTACT#")) {
      const { id, type, userId: _, updatedAt, ...cleanItem } = item;
      userData.contacts.push(cleanItem as Contact);
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

  const putNested = async (items: NestedItem[], prefix: string) => {
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
    console.log(connectionData.parentId)
    const connectionItem = {
      id: `CONNECTION#${connectionId}`,
      type: `PERSON#${connectionId}`,
      userId,
      connectionId,
      parentId: connectionData.parentId || "root",
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
  
    const putNested = async (items: NestedItem[], prefix: string) => {
        for (const item of items ?? []) {
        const nestedId = uuidv4();
        await ddb.send(
            new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id: `${prefix}#${nestedId}`,
                type: `${prefix}#${nestedId}`,
                connectionId,
                userId,
                parentId: connectionData.parentId || "root", 
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

  type FullConnection = Omit<Person, "id"> & {
    id: string;
    connectionId: string;
    experience: Experience[];
    education: Education[];
    contacts: Contact[];
  };

  
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
  const connectionsMap: Record<string, FullConnection> = {};

  for (const item of items) {
    const connectionId = item.connectionId;
    if (!connectionId) continue;

    if (!connectionsMap[connectionId]) {
        connectionsMap[connectionId] = {
          id: connectionId,
          parentId: item.parentId || "root",
          firstName: "",
          lastName: "",
          headshot: "",
          skills: [],
          tags: [],
          notes: "",
          experience: [],
          education: [],
          contacts: [],
          connectionId,
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
      entry.experience.push(cleanItem as Experience);
    } else if (item.type.startsWith("EDU#")) {
      const { id, type, userId: _, connectionId: __, updatedAt, ...cleanItem } = item;
      entry.education.push(cleanItem as Education);
    } else if (item.type.startsWith("CONTACT#")) {
      const { id, type, userId: _, connectionId: __, updatedAt, ...cleanItem } = item;
      entry.contacts.push(cleanItem as Contact);
    }
  }

  return Object.values(connectionsMap);
}
type ConnectionUpdateFields = Partial<Omit<FullConnection, "id" | "connectionId" | "experience" | "education" | "contacts">>;

// -------------------- UPDATE CONNECTION --------------------
type DynamoValue = string | number | boolean | Array<string | number | boolean>;

export async function updateConnection(
  userId: string,
  connectionId: string,
  updates: Partial<Omit<FullConnection, "id" | "connectionId" | "experience" | "education" | "contacts">>
) {
  const pk = `CONNECTION#${connectionId}`;
  const now = new Date().toISOString();

  const updateExpressions: string[] = [];
  const expressionValues: Record<string, DynamoValue> = {};

  Object.entries(updates).forEach(([key, value], idx) => {
    if (value !== undefined) {
      const placeholder = `:val${idx}`;
      updateExpressions.push(`${key} = ${placeholder}`);
      expressionValues[placeholder] = value as DynamoValue;
    }
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
  console.log("TABLE_NAME:", TABLE_NAME);
  console.log("Attempting to delete connectionId:", connectionId);
  
  // Query for all items with this connectionId using the GSI
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: CONNECTIONS_GSI,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "connectionId = :connectionId",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":connectionId": connectionId,
      },
    })
  );

  const itemsToDelete = result.Items ?? [];
  
  console.log("Items found to delete:", itemsToDelete.map(item => ({ id: item.id })));
  
  if (itemsToDelete.length === 0) {
    return { message: "Connection not found" };
  }

  // Delete each item using only the id (partition key)
  for (const item of itemsToDelete) {
    console.log("Deleting item with id:", item.id);
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: item.id },
      })
    );
    console.log("Successfully deleted item:", item.id);
  }

  return { message: "Connection and all related items deleted successfully" };
}
