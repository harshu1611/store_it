"use client";

import { avatarPlaceholderImage, navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}
const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/icons/logo-full-brand.svg"
          alt="logo"
          height={50}
          width={160}
          className="hidden h-auto lg:block"
        />
        <Image
          src="/assets/icons/logo-brand.svg"
          width={52}
          height={52}
          alt="logo"
          className="lg:hidden"
        />
      </Link>

      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map((item, index) => {
            return (
              <Link key={index} href={item.url} className="lg:w-full">
                <li
                  className={`sidebar-nav-item ${pathname === item.url && "shad-active"}`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    className={`nav-icon ${pathname === item.url && "nav-icon-active"}`}
                  />
                  <p className="hidden lg:block">{item.name}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </nav>
      <Image
        src="/assets/images/files-2.png"
        alt="files"
        width={230}
        height={200}
        className="w-full"
      />
      <div className="sidebar-user-info">
        <Image
          src={avatarPlaceholderImage}
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
