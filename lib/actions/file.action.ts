"use server";

// import { UploadProps } from "@/types";
import { createAdminClient, createSessionClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";
import { parse } from "path";
const nodemailer = require("nodemailer");

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucket,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      ownerId: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollection,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucket, bucketFile.$id),
          console.log(error);
      });
    revalidatePath(path);
    // console.log(newFile)
    return parseStringify(newFile);
  } catch (error) {
    throw error;
    console.log(error);
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("ownerId", currentUser.$id),
      Query.contains("users", currentUser.email),
    ]),
  ];

  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }

  if (searchText) {
    queries.push(Query.contains("name", searchText));
  }
  if (limit) {
    queries.push(Query.limit(limit));
  }

  const [sortBy, orderBy] = sort.split("-");

  queries.push(
    orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
  );

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not found");
    }
    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollection,
      queries
    );
    return parseStringify(files);
  } catch (error) {}
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();
  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollection,
      fileId,
      {
        name: newName,
      }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    throw error;
  }
};

export const updatedFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollection,
      fileId,
      {
        users: emails,
      }
    );
    if(updatedFile){

      sendEmail(emails, updatedFile)
    }
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    throw error;
  }
};

export const isSharedFile = async ({ file }: { file: Models.Document }) => {
  try {
    const currentUser = await getCurrentUser();
    // console.log(currentUser,file);
    if (file.ownerId.accountId === currentUser.accountId) {
      return parseStringify({ isShared: false });
    }

    return parseStringify({ isShared: true });
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollection,
      fileId
    );
    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucket, bucketFileId);
    }
    revalidatePath(path);
    return parseStringify({ status: "Success" });
  } catch (error) {
    throw error;
  }
};

export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollection,
      [Query.equal("ownerId", [currentUser.$id])]
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });
    return parseStringify(totalSpace);
  } catch (error) {
    throw error;
  }
}

const sendEmail=(emails:string[],updatedFile:any)=>{
  const transporter = nodemailer.createTransport({
    service:"Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth:{
        user: process.env.NEXT_PUBLIC_SMTP_USER_EMAIL,
        pass:process.env.NEXT_PUBLIC_SMTP_USER_PASS
    }
  });

  emails.forEach((email)=>{
    const mailOptions = {
      from: process.env.NEXT_PUBLIC_SMTP_USER_EMAIL,
      to: email,
      subject: `File shared in StoreIt by ${updatedFile.ownerId.fullName}`,
      text: `File ${updatedFile.name} has been shared with you by ${updatedFile.ownerId.fullName}. You can access the file at StoreIT dashboard. `,
    };
  
   transporter.sendMail(mailOptions,(error:any,info:any)=>{
      if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
   })
  })
  
}