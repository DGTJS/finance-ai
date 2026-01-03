"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Briefcase,
  MessageSquare,
  Clock,
  Building2,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getUserSettings } from "@/app/_actions/user-settings";
import { useSidebar } from "@/app/_contexts/sidebar-context";
import { useCompany } from "@/app/_contexts/company-context";
import { cn } from "@/app/_lib/utils";
import { Button } from "@/app/_components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userTitle, setUserTitle] = useState("Gerente Financeiro");
  const { isOpen, toggleSidebar } = useSidebar();
  const company = useCompany();

  const baseNavItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transações", icon: ShoppingCart },
    { href: "/subscription", label: "Assinaturas", icon: Briefcase },
    { href: "/goals", label: "Metas", icon: MessageSquare },
    { href: "/entrepreneur", label: "Freelancer", icon: Clock },
    { href: "/dashboard/company", label: "Empresa", icon: Building2 },
  ];

  // Adicionar Estoque apenas se a empresa tiver hasStock = true
  const navItems = [
    ...baseNavItems,
    ...(company && company.hasStock
      ? [{ href: "/dashboard/company/stock", label: "Estoque", icon: Package }]
      : []),
    { href: "/profile-finance", label: "Perfil Financeiro", icon: User },
  ];

  const bottomItems = [
    { href: "/settings", label: "Configurações", icon: Settings },
    { href: "/help", label: "Ajuda", icon: HelpCircle },
  ];

  const userName = session?.user?.name || session?.user?.email || "Usuário";
  const userImage = session?.user?.image;
  const firstName = userName.split(" ")[0];

  useEffect(() => {
    const fetchUserTitle = async () => {
      if (session?.user?.id) {
        try {
          const result = await getUserSettings();
          if (result.success && result.data?.userTitle) {
            setUserTitle(result.data.userTitle);
          }
        } catch (error) {
          console.error("Erro ao buscar título do usuário:", error);
        }
      }
    };

    fetchUserTitle();
  }, [session?.user?.id]);

  const NavItem = ({
    item,
    isActive,
  }: {
    item: (typeof navItems)[0];
    isActive: boolean;
  }) => {
    const Icon = item.icon;
    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center rounded-lg transition-all duration-300 ease-in-out",
          isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-2",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors duration-300",
            isActive && "text-primary",
          )}
        />
        <span
          className={cn(
            "truncate text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out",
            isOpen
              ? "ml-0 max-w-full opacity-100"
              : "ml-0 max-w-0 overflow-hidden opacity-0",
          )}
        >
          {item.label}
        </span>
      </Link>
    );

    if (!isOpen) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-background fixed top-0 left-0 z-40 hidden h-screen flex-col border-r lg:flex",
          "transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* Header com Perfil */}
        <div
          className={cn(
            "border-b transition-[padding] duration-300 ease-in-out",
            isOpen ? "p-6" : "p-3",
          )}
        >
          {isOpen ? (
            <div className="flex items-center gap-3 transition-all duration-300 ease-in-out">
              <Avatar className="h-12 w-12 shrink-0 transition-all duration-300 ease-in-out">
                {userImage && <AvatarImage src={userImage} alt={userName} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="truncate text-sm font-semibold">{userName}</h3>
                <p className="text-muted-foreground truncate text-xs">
                  {userTitle}
                </p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="shrink-0 transition-all duration-300 ease-in-out"
                    aria-label="Fechar menu"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Fechar menu</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out">
              <Avatar className="h-10 w-10 shrink-0 transition-all duration-300 ease-in-out">
                {userImage && <AvatarImage src={userImage} alt={userName} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="w-full transition-all duration-300 ease-in-out"
                    aria-label="Abrir menu"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Abrir menu</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Menu Principal */}
        <ScrollArea className="flex-1">
          <div
            className={cn(
              "transition-[padding] duration-300 ease-in-out",
              isOpen ? "space-y-6 p-4" : "space-y-2 p-2",
            )}
          >
            {/* Menu Items */}
            <div className="space-y-1">
              <p
                className={cn(
                  "text-muted-foreground mb-2 overflow-hidden px-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ease-in-out",
                  isOpen
                    ? "mb-2 max-h-8 opacity-100"
                    : "mb-0 max-h-0 opacity-0",
                )}
              >
                Menu
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavItem key={item.href} item={item} isActive={isActive} />
                  );
                })}
              </nav>
            </div>

            {/* Outros Items */}
            <div className="space-y-1">
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <Separator className="my-4" />
                <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                  Outros
                </p>
              </div>
              <nav className="space-y-1">
                {bottomItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavItem key={item.href} item={item} isActive={isActive} />
                  );
                })}
              </nav>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
