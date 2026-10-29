"use client";

import { useNavGroups } from "./use-nav-groups";
import { Sidebar } from "../shell/sidebar";

function AppSidebar({
  collapsed,
  onExpand,
  onNavigate,
}: {
  collapsed: boolean;
  onExpand?: () => void;
  onNavigate?: () => void;
}) {
  const { groups, loading } = useNavGroups();

  return (
    <Sidebar
      groups={groups}
      loading={loading}
      collapsed={collapsed}
      onExpand={onExpand}
      onNavigate={onNavigate}
    />
  );
}

export default AppSidebar;
