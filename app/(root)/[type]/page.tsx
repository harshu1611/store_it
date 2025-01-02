import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.action";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { Models } from "node-appwrite";
import React from "react";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";

  const searchText = ((await searchParams)?.query as string) || "";

  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types: types, searchText, sort });

  const totalSpace = await getTotalSpaceUsed();

  const getSpace = () => {
    let space;
    if (type === "media") {
      space = totalSpace["video"].size + totalSpace["audio"].size;
    } else space = totalSpace[type.split("s")[0]].size;

    return space;
  };

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{convertFileSize(getSpace())}</span>
          </p>
          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">
              Sort By: <Sort />
            </p>
          </div>
        </div>
      </section>
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document, index: any) => {
            return <Card key={index} file={file}></Card>;
          })}
        </section>
      ) : (
        <p className="empty-list">No files Uploaded</p>
      )}
    </div>
  );
};

export default Page;
