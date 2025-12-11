"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaHome,
  FaReceipt,
  FaCreditCard,
  FaCog,
  FaDollarSign,
  FaBullseye,
  FaSearch,
} from "react-icons/fa";
import { useState } from "react";
import NotificationsDropdown from "./notifications-dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: FaHome },
    { href: "/transactions", label: "Transações", icon: FaReceipt },
    { href: "/subscription", label: "Assinatura", icon: FaCreditCard },
    { href: "/goals", label: "Metas", icon: FaBullseye },
    { href: "/economy", label: "Economia", icon: FaDollarSign },
    { href: "/settings", label: "Configurações", icon: FaCog },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-card fixed top-0 right-0 left-0 z-50 border-b lg:left-64">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo e Título da página */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.png"
                width={120}
                height={27}
                alt="Finance AI"
                className="h-10 w-full sm:h-10"
                priority
              />
            </Link>
            {/* <h1 className="text-lg font-bold truncate sm:text-xl md:text-2xl">
              {navLinks.find((link) => link.href === pathname)?.label ||
                "Dashboard"}
            </h1> */}
          </div>

          {/* Busca e Ações */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Barra de Busca */}
            <div className="bg-muted hidden min-w-[200px] items-center gap-2 rounded-lg border px-3 py-2 md:flex lg:min-w-[300px]">
              <FaSearch className="text-muted-foreground h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Digite sua busca"
                className="placeholder:text-muted-foreground min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              />
            </div>

            {/* Notificações */}
            <NotificationsDropdown />

            {/* Avatar do Usuário com Dropdown */}
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="focus:ring-ring flex shrink-0 items-center gap-2 rounded-full transition-colors hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  {session?.user?.image ? (
                    <div className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-gray-200">
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Usuário"}
                        className="h-full w-full object-cover object-center"
                        style={{
                          objectPosition: "center center",
                          minWidth: "100%",
                          minHeight: "100%",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-xs font-bold text-white">
                      {(session?.user?.name || session?.user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Usuário"}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white">
                        {(session?.user?.name || session?.user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {session?.user?.name || "Usuário"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <FaUser className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <FaCog className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                  <div className="bg-border my-1 h-px" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-destructive hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="relative z-[110] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu - Separado da navbar */}
      {mobileMenuOpen && (
        <div className="bg-background fixed top-16 right-0 left-0 z-[100] max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-b shadow-lg md:hidden">
          <div className="container mx-auto px-4 py-4">
            {/* User Info Mobile */}
            <div className="bg-muted/50 mb-4 flex items-center gap-3 rounded-lg border p-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <FaUser className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Navigation Links Mobile */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button Mobile */}
            <Button
              variant="outline"
              className="mt-4 w-full gap-2"
              onClick={handleSignOut}
            >
              <FaSignOutAlt className="h-4 w-4" />
              Sair da conta
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
