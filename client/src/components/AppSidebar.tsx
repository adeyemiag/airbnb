import { usePathname } from "next/navigation";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  Building,
  FileText,
  Heart,
  Home,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AppSidebar = ({ userType }: AppSidebarProps) => {
  const pathname = usePathname();
  const { toggleSidebar, open } = useSidebar();

  const navLinks =
    userType === "manager"
      ? [
          { icon: Building, label: "Properties", href: "/managers/properties" },
          {
            icon: FileText,
            label: "Applications",
            href: "/managers/applications",
          },
          { icon: Settings, label: "Settings", href: "/managers/settings" },
        ]
      : [
          { icon: Heart, label: "Favorites", href: "/tenants/favorites" },
          {
            icon: FileText,
            label: "Applications",
            href: "/tenants/applications",
          },
          { icon: Home, label: "Residences", href: "/tenants/residences" },
          { icon: Settings, label: "Settings", href: "/tenants/settings" },
        ];

  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 border-r border-gray-100 bg-white"
      style={{
        top: `${NAVBAR_HEIGHT}px`,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex min-h-[64px] w-full items-center pt-4 mb-2",
                open ? "justify-between px-5" : "justify-center",
              )}
            >
              {open ? (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {userType === "manager" ? "Manager" : "Renter"}
                    </p>
                    <h1 className="text-base font-bold text-gray-800">
                      Dashboard
                    </h1>
                  </div>
                  <button
                    className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    onClick={() => toggleSidebar()}
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </>
              ) : (
                <button
                  className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  onClick={() => toggleSidebar()}
                >
                  <Menu className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-primary-700 text-white shadow-md shadow-primary-700/20"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                    !open && "justify-center px-0",
                  )}
                >
                  <Link href={link.href} className="w-full" scroll={false}>
                    <div className="flex items-center gap-3">
                      <link.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-white" : "text-gray-400",
                        )}
                      />
                      {open && (
                        <span
                          className={cn(
                            "font-medium text-sm",
                            isActive ? "text-white" : "text-gray-600",
                          )}
                        >
                          {link.label}
                        </span>
                      )}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
