"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaReceipt, FaCreditCard, FaDollarSign, FaChartLine, FaCog, FaQuestionCircle, FaBullseye, FaShoppingCart, FaBriefcase, FaComments, FaUser, FaClock } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { getUserSettings } from "@/app/_actions/user-settings";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userTitle, setUserTitle] = useState("Gerente Financeiro");

  const navItems = [
    { href: "/", label: "Dashboard", icon: FaHome },
    { href: "/transactions", label: "Transações", icon: FaShoppingCart },
    { href: "/subscription", label: "Assinaturas", icon: FaBriefcase },
    { href: "/goals", label: "Metas", icon: FaComments },
    { href: "/entrepreneur", label: "Freelancer", icon: FaClock },
    { href: "/profile-finance", label: "Perfil Financeiro", icon: FaUser },
  ];

  const bottomItems = [
    { href: "/settings", label: "Configurações", icon: FaCog },
    { href: "/help", label: "Ajuda", icon: FaQuestionCircle },
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

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-white lg:flex">
      {/* Perfil do Usuário no Topo */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          {userImage ? (
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={userImage}
                alt={userName}
                className="h-full w-full object-cover object-center"
                style={{ 
                  objectPosition: "center center",
                  minWidth: "100%",
                  minHeight: "100%"
                }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold border-2 border-gray-200">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {userName}
            </h3>
            <p className="text-gray-500 text-xs">
              {userTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
            MENU
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-green-600" : ""}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Outros */}
        <div className="mt-6">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
            OUTROS
          </p>
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
