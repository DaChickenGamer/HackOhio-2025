import { GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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
      userData.experience.push({
        role: item.role,
        company: item.company,
        duration: item.duration,
      } as Experience);
    } else if (item.type.startsWith("EDU#")) {
      userData.education.push({
        degree: item.degree,
        school: item.school,
        year: item.year,
      } as Education);
    } else if (item.type.startsWith("CONTACT#")) {
        userData.contacts.push({
          type: item.contactType ?? item.typeLabel ?? item.contact_type ?? item.type, // be forgiving
        value: item.value,
      } as Contact);
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
      const base: Record<string, unknown> = {
        id: `ROOT#${userData.id}`,
        type: `${prefix}#${nestedId}`,
        userId: userData.id,
        updatedAt: now,
      };
      const payload =
        prefix === "CONTACT"
          ? { ...base, contactType: (item as Contact).type, value: (item as Contact).value }
          : { ...base, ...item };

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: payload,
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
      entry.experience.push({
        role: item.role,
        company: item.company,
        duration: item.duration,
      } as Experience);
    } else if (item.type.startsWith("EDU#")) {
      entry.education.push({
        degree: item.degree,
        school: item.school,
        year: item.year,
      } as Education);
    } else if (item.type.startsWith("CONTACT#")) {
      entry.contacts.push({
        type: item.typeLabel ?? item.contactType ?? item.contact_type ?? item.typeValue ?? item.method ?? item.type, // be forgiving
        value: item.value,
      } as Contact);
    }
  }

  return Object.values(connectionsMap);
}
// removed unused type

// -------------------- UPDATE CONNECTION --------------------
type DynamoValue = string | number | boolean | Array<string | number | boolean>;

export async function updateConnection(
  userId: string,
  connectionId: string,
  updates: Partial<Omit<FullConnection, "id" | "connectionId">>
) {
  const pk = `CONNECTION#${connectionId}`;
  const now = new Date().toISOString();

  const updateExpressions: string[] = [];
  const expressionValues: Record<string, DynamoValue> = {};

   // Filter out fields that cannot be updated (key attributes and computed fields)
   const allowedFields = ['firstName', 'lastName', 'headshot', 'skills', 'tags', 'notes', 'parentId'];
   const filteredUpdates = Object.fromEntries(
     Object.entries(updates).filter(([key]) => allowedFields.includes(key))
   );

   Object.entries(filteredUpdates).forEach(([key, value], idx) => {
    if (value !== undefined) {
      const placeholder = `:val${idx}`;
      updateExpressions.push(`${key} = ${placeholder}`);
      expressionValues[placeholder] = value as DynamoValue;
    }
  });

  updateExpressions.push("updatedAt = :updatedAt");
  expressionValues[":updatedAt"] = now;
  expressionValues[":userId"] = userId;

  console.log("Updating connection with id:", pk);
  console.log("Update expressions:", updateExpressions);
  console.log("Expression values:", expressionValues);

  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: pk },
      UpdateExpression: "SET " + updateExpressions.join(", "),
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: expressionValues,
      ReturnValues: "ALL_NEW",
    })
  );

  console.log("Update successful:", result.Attributes);

  // Replace experiences if provided
  if (Array.isArray(updates.experience)) {
    const expPrefix = "EXP#";
    const parentId = (result.Attributes?.parentId as string) || "root";

    // 1) Find existing EXP items for this connection
    const existingExp = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: CONNECTIONS_GSI,
        KeyConditionExpression: "userId = :userId AND begins_with(#sk, :prefix)",
        FilterExpression: "connectionId = :connectionId",
        ExpressionAttributeNames: { "#sk": "type" },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":connectionId": connectionId,
          ":prefix": expPrefix,
        },
      })
    );

    // 2) Delete old EXP items
    for (const it of existingExp.Items ?? []) {
      await ddb.send(
        new DeleteCommand({ TableName: TABLE_NAME, Key: { id: it.id } })
      );
    }

    // 3) Insert new EXP items
    const now = new Date().toISOString();
  for (const exp of (updates.experience as Experience[])) {
      const nestedId = uuidv4();
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: `${"EXP"}#${nestedId}`,
            type: `${"EXP"}#${nestedId}`,
            connectionId,
            userId,
            parentId,
            updatedAt: now,
            ...exp,
          },
        })
      );
    }
  }

  // Replace education if provided
  if (Array.isArray(updates.education)) {
    const eduPrefix = "EDU#";
    const parentId = (result.Attributes?.parentId as string) || "root";

    const existingEdu = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: CONNECTIONS_GSI,
        KeyConditionExpression: "userId = :userId AND begins_with(#sk, :prefix)",
        FilterExpression: "connectionId = :connectionId",
        ExpressionAttributeNames: { "#sk": "type" },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":connectionId": connectionId,
          ":prefix": eduPrefix,
        },
      })
    );

    for (const it of existingEdu.Items ?? []) {
      await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: it.id } }));
    }

    const now2 = new Date().toISOString();
    for (const edu of updates.education) {
      const nestedId = uuidv4();
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: `${"EDU"}#${nestedId}`,
            type: `${"EDU"}#${nestedId}`,
            connectionId,
            userId,
            parentId,
            updatedAt: now2,
            degree: edu.degree,
            school: edu.school,
            year: edu.year,
          },
        })
      );
    }
  }

  // Replace contacts if provided
  if (Array.isArray(updates.contacts)) {
    const conPrefix = "CONTACT#";
    const parentId = (result.Attributes?.parentId as string) || "root";

    const existingContacts = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: CONNECTIONS_GSI,
        KeyConditionExpression: "userId = :userId AND begins_with(#sk, :prefix)",
        FilterExpression: "connectionId = :connectionId",
        ExpressionAttributeNames: { "#sk": "type" },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":connectionId": connectionId,
          ":prefix": conPrefix,
        },
      })
    );

    for (const it of existingContacts.Items ?? []) {
      await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: it.id } }));
    }

    const now3 = new Date().toISOString();
    for (const c of updates.contacts) {
      const nestedId = uuidv4();
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: `${"CONTACT"}#${nestedId}`,
            type: `${"CONTACT"}#${nestedId}`,
            connectionId,
            userId,
            parentId,
            updatedAt: now3,
            contactType: c.type,
            value: c.value,
          },
        })
      );
    }
  }

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
