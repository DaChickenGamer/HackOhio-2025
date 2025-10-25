import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./client";

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

export async function putUser(userData: {
    userId: string;
    firstName: string;
    lastName: string;
    picture?: string;
    skills?: string[];
    isRoot?: boolean;
}) {
    const item = {
        id: userData.userId,
        type: "Root",
        isRoot: userData.isRoot ?? true,
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.picture ?? null,
        skills: userData.skills ?? [],
        updatedAt: new Date().toISOString(),
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        })
    );

    return item;
}
