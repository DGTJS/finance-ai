"use client";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-solid px-8 py-4">
      <div className="flex items-center gap-10">
        <Image src="/logo.svg" alt="Finance AI" width={173} height={39} />
        <Link
          href="/"
          className={
            pathname === "/" ? "text-primary font-bold" : "text-gray-200"
          }
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={
            pathname === "/transactions"
              ? "text-primary font-bold"
              : "text-gray-200"
          }
        >
          Transações
        </Link>
        <Link
          href="/subscription"
          className={
            pathname === "/subscription"
              ? "text-primary font-bold"
              : "text-gray-200"
          }
        >
          Assinatura
        </Link>
      </div>
      <div className="border-border flex items-center gap-4 rounded-lg border px-4 py-2">
        <UserButton showName />
      </div>
    </nav>
  );
};

export default Navbar;
