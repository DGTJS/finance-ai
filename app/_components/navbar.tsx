"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { useSidebar } from "@/app/_contexts/sidebar-context";
import { cn } from "@/app/_lib/utils";
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
  FaBuilding,
} from "react-icons/fa";
import { useState } from "react";
import NotificationsDropdown from "./notifications-dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { isOpen } = useSidebar();

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevenir múltiplos cliques

    try {
      setIsSigningOut(true);

      // Fechar menus antes de fazer signOut
      setUserMenuOpen(false);
      setMobileMenuOpen(false);

      // Usar window.location.origin para garantir que usa a porta correta
      const callbackUrl = `${window.location.origin}/login`;

      // Fazer signOut e redirecionar
      await signOut({
        callbackUrl,
        redirect: true,
      });

      // Se o signOut não redirecionar automaticamente, forçar redirecionamento
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Em caso de erro, forçar redirecionamento
      window.location.href = "/login";
    } finally {
      setIsSigningOut(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: FaHome },
    { href: "/transactions", label: "Transações", icon: FaReceipt },
    { href: "/subscription", label: "Assinatura", icon: FaCreditCard },
    { href: "/goals", label: "Metas", icon: FaBullseye },
    { href: "/entrepreneur", label: "Freelancer", icon: FaUser },
    { href: "/dashboard/company", label: "Empresa", icon: FaBuilding },
    {
      href: "/profile-finance",
      label: "Perfil Financeiro",
      icon: FaCreditCard,
    },
    { href: "/economy", label: "Economia", icon: FaDollarSign },
    { href: "/settings", label: "Configurações", icon: FaCog },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={cn(
          "bg-card fixed top-0 right-0 z-50 border-b",
          "left-0 transition-[left] duration-300 ease-in-out",
          isOpen ? "lg:left-64" : "lg:left-20",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Mobile Menu Button - Esquerda */}
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="relative z-[110]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </Button>
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.png"
                width={120}
                height={27}
                alt="Finance AI"
                className="h-6 w-full *:w-auto sm:h-10"
                priority
              />
            </Link>
          </div>

          {/* Logo e Título da página - Desktop */}
          <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.png"
                width={120}
                height={27}
                alt="Finance AI"
                className="h-6 w-full *:w-auto sm:h-10"
                priority
              />
            </Link>
          </div>

          {/* Busca e Ações */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Barra de Busca */}
            <div className="bg-muted hidden min-w-[200px] items-center gap-2 rounded-lg border px-3 py-2 lg:flex lg:min-w-[300px]">
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
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Usuário"}
                        width={32}
                        height={32}
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
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Usuário"}
                          width={40}
                          height={40}
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
                    <FaCog className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                  <div className="bg-border my-1 h-px" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-destructive hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>{isSigningOut ? "Saindo..." : "Sair"}</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>

      {/* Overlay para fechar menu */}
      {mobileMenuOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Drawer Lateral */}
      <div
        className={`bg-background fixed top-0 left-0 z-[100] h-full w-80 max-w-[85vw] overflow-y-auto border-r shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header do Menu Lateral */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <FaTimes className="h-5 w-5" />
            </Button>
          </div>

          {/* Conteúdo do Menu */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Informações do Usuário */}
            <div className="mb-6 border-b pb-6">
              <div className="mb-2 flex items-center gap-3">
                {session?.user?.image ? (
                  <div className="border-primary/20 h-12 w-12 overflow-hidden rounded-full border-2">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Usuário"}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-gradient-to-br from-green-500 to-green-600 text-base font-bold text-white">
                    {(session?.user?.name || session?.user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">
                    {session?.user?.name || "Usuário"}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links Mobile - Agrupados */}
            <div className="mb-6 space-y-2">
              <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                Principal
              </p>
              {navLinks.slice(0, 4).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "text-foreground hover:bg-muted active:bg-muted/80"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? "" : "text-muted-foreground"}`}
                    />
                    <span className="text-base">{link.label}</span>
                    {isActive && (
                      <div className="bg-primary-foreground/50 ml-auto h-2 w-2 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                Outros
              </p>
              {navLinks.slice(4).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "text-foreground hover:bg-muted active:bg-muted/80"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? "" : "text-muted-foreground"}`}
                    />
                    <span className="text-base">{link.label}</span>
                    {isActive && (
                      <div className="bg-primary-foreground/50 ml-auto h-2 w-2 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer com Logout */}
          <div className="border-t p-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSigningOut}
              className="border-destructive/20 text-destructive hover:bg-destructive h-12 w-full gap-2 text-base hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSignOut}
            >
              <FaSignOutAlt className="h-5 w-5" />
              {isSigningOut ? "Saindo..." : "Sair da conta"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
