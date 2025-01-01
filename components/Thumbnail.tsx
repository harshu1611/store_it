import { getFileIcon } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName = "",
  className = "",
}: {
  type: string;
  extension: string;
  url: string;
  imageClassName?: string;
  className?: string;
}) => {
  const isImage = type === "image" && extension !== "svg";
  return (
    <figure className={`thumbnail ${className}`}>
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={`size-8 object-contain ${imageClassName} ${isImage && "thumbnail-image"}`}
      />
    </figure>
  );
};

export default Thumbnail;
