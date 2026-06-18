import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider } from "@/store/app-store";

export const Route = createFileRoute("/clients")({
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AppStoreProvider>
  ),
});
