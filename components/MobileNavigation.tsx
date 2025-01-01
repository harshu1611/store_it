"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { avatarPlaceholderImage, navItems } from "@/constants";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";


interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

const MobileNavigation = ({$id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  return (
    <header className="mobile-header">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="search"
            height={30}
            width={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user ">
              <Image
                src={avatarPlaceholderImage}
                alt="avatar"
                height={44}
                width={44}
                className="header-user-avatar "
              />
              <div className="sm:hidden lg:hidden">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map((item, index) => {
                return (
                  <Link key={index} href={item.url} className="lg:w-full">
                    <li
                      className={`mobile-nav-item ${pathname === item.url && "shad-active"}`}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={24}
                        height={24}
                        className={`nav-icon ${pathname === item.url && "nav-icon-active"}`}
                      />
                      <p className="">{item.name}</p>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </nav>
          <Separator className="my-5 bg-light-200/20" />
          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader ownerId={ownerId} accountId={accountId}/>
            <Button type="submit" className="mobile-sign-out-button" onClick={async()=>{
              await signOutUser()
            }}>
              <Image
                src="/assets/icons/logout.svg"
                alt="logout"
                height={24}
                width={24}

              />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
