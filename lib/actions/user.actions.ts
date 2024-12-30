"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";


const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollection,
    [Query.equal("email", email)]
  );

  return result.total > 0 ? result.documents[0] : null;
};

export const sendEmailOTP = async (email: string) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const verifyOtp= async ({accountId, Otp}: {accountId: string, Otp: string})=>{
  const {account}= await createAdminClient()

  const session= await account.createSession(accountId,Otp)

  ;(await cookies()).set('appwrite-session',session.secret,{

    path:'/',
    httpOnly:true,
    sameSite:'strict',
    secure:true

  })

  return parseStringify({sessionid: session.$id})
}

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP(email);

  if (!accountId) throw new Error("Failed to send OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollection,
    ID.unique(),
    {
       fullName,
       email, 
       avatar:"aaa",
       accountId 
    }
    )
  }

  return parseStringify({accountId})
};
