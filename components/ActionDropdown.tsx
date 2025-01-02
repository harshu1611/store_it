"use client";

import { Models } from "node-appwrite";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  deleteFile,
  isSharedFile,
  renameFile,
  updatedFileUsers,
} from "@/lib/actions/file.action";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionsModalContent";
// import { FileDetails } from "./ActionsModalContent";

const ActionDropdown = ({
  file,
  shared,
}: {
  file: Models.Document;
  shared: any;
}) => {
  const { isShared } = shared;
  const path = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropddownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<any>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [shareEmails, setShareEmails] = useState<string[]>([]);

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => {
        updatedFileUsers({ fileId: file.$id, emails: shareEmails, path });
      },
      delete: async () =>
        await deleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        }),
    };
    success = await actions[action.value as keyof typeof actions]();

    if (success) {
      closeAllModals();
    }

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = shareEmails.filter((e) => e !== email);

    const success = await updatedFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) {
      setShareEmails(updatedEmails);
    }

    closeAllModals();
  };
  const rendeerDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-30">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" &&
            (!isShared ? (
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            ) : (
              <p className="text-center">
                Only Owner (
                <span className="text-brand-100">{file.ownerId.fullName}</span>)
                can edit the file
              </p>
            ))}
          {value === "details" && <FileDetails file={file} />}

          {value === "share" &&
            (!isShared ? (
              <ShareInput
                file={file}
                onInputChange={setShareEmails}
                onRemove={handleRemoveUser}
              />
            ) : (
              <p className="text-center">
                Only Owner (
                <span className="text-brand-100">{file.ownerId.fullName}</span>)
                can edit the file
              </p>
            ))}

          {value === "delete" &&
            (!isShared ? (
              <p className="delete-confirmation">
                Are you sure you want to delete {` `}{" "}
                <span className="delete-file-name">{file.name}</span>?
              </p>
            ) : (
              <p className="text-center">
                Only Owner (
                <span className="text-brand-100">{file.ownerId.fullName}</span>)
                can edit the file
              </p>
            ))}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) ? (
          isShared ? (
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
          ) : (
            <DialogFooter className="flex flex-col gap-3 md:flex-row">
              <Button onClick={closeAllModals} className="modal-cancel-button">
                Cancel
              </Button>
              <Button onClick={handleAction} className="modal-submit-button">
                <p className="capitalize">{value}</p>
                {isLoading && (
                  <Image
                    src="/assets/icons/loader.svg"
                    alt="loader"
                    width={24}
                    height={24}
                    className="animate-spin"
                  />
                )}
              </Button>
            </DialogFooter>
          )
        ) : (
          ""
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropddownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item, index) => {
            return (
              <DropdownMenuItem
                className="shad-dropdown-item"
                onClick={() => {
                  setAction(item);

                  if (
                    ["rename", "share", "delete", "details"].includes(
                      item.value
                    )
                  ) {
                    setIsModalOpen(true);
                  }
                }}
                key={index}
              >
                {item.value === "download" ? (
                  <Link
                    href={constructDownloadUrl(file.bucketFileId)}
                    download={file.name}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      height={30}
                      width={30}
                    />

                    {item.label}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.icon}
                      alt={item.label}
                      height={30}
                      width={30}
                    />

                    {item.label}
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {rendeerDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
