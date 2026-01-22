"use client";

import { getSocket } from "@/lib/sockets";
import { userQ } from "@/queries/baseModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useStore } from "./datastore";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { user, update } = useStore();
  const userQuery = useMutation({
    mutationFn: (id: number) =>
      userQ.getOne(id).then((res) => update({ user: res.data })),
  });

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("🔌 Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // 🔥 GLOBAL INVALIDATION

    /**
     * Payments
     */

    socket.on("payment:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    socket.on("payment:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    socket.on("payment:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    /**
     * Requests
     */

    socket.on("request:new", (data: { userId?: number }) => {
      if (data && data.userId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ["requests", data.userId],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["requests-user", data.userId],
          refetchType: "active",
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["requests"],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["requests-user"],
          refetchType: "active",
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
    });

    socket.on("request:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-user"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    socket.on("request:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
    });

    /**
     * transaction
     */

    socket.on("transaction:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    socket.on("transaction:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
    });

    socket.on("transaction:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        refetchType: "active",
      });
    });

    /**
     * commandrequests
     */

    socket.on("command:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["commands"],
        refetchType: "active",
      });
    });

    socket.on("command:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["commands"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
    });

    socket.on("command:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["commands"],
        refetchType: "active",
      });
    });

    /**
     * purchaseOrder
     */

    socket.on("purchaseOrder:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrders"],
        refetchType: "active",
      });
    });

    socket.on("purchaseOrder:update", () => {
      console.log("Purchasing");
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrders"],
        refetchType: "active",
      });
    });

    socket.on("purchaseOrder:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrders"],
        refetchType: "active",
      });
    });

    /**
     * bank
     */

    socket.on("bank:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "active",
      });
    });

    socket.on("bank:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "active",
      });
    });

    socket.on("bank:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "active",
      });
    });

    /**
     * quotation
     */

    socket.on("quotation:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["quotations"],
        refetchType: "active",
      });
    });

    socket.on("quotation:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["quotations"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["commands"],
        refetchType: "active",
      });
    });

    socket.on("quotation:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["quotations"],
        refetchType: "active",
      });
    });

    /**
     * provider
     */

    socket.on("provider:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["providers"],
        refetchType: "active",
      });
    });

    socket.on("provider:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["providers"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["providersList"],
        refetchType: "active",
      });
    });

    socket.on("provider:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["providers"],
        refetchType: "active",
      });
    });

    /**
     * project
     */

    socket.on("project:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        refetchType: "active",
      });
    });

    socket.on("project:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["projectsList"],
        refetchType: "active",
      });
    });

    socket.on("project:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        refetchType: "active",
      });
    });

    /**
     * category
     */

    socket.on("category:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["categoryList"],
        refetchType: "active",
      });
    });

    socket.on("category:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["categoryList"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["categoryies"] });
    });

    socket.on("category:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["categoryList"],
        refetchType: "active",
      });
    });

    /**
     * signatair
     */

    socket.on("signatair:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["signatairs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["SignatairList"],
        refetchType: "active",
      });
    });

    socket.on("signatair:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["signatairs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["SignatairList"],
        refetchType: "active",
      });
    });

    socket.on("signatair:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["signatairs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["SignatairList"],
        refetchType: "active",
      });
    });

    /**
     * reception
     */

    socket.on("reception:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["receptions"],
        refetchType: "active",
      });
    });

    socket.on("reception:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["receptions"],
        refetchType: "active",
      });
    });

    socket.on("reception:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["receptions"],
        refetchType: "active",
      });
    });

    /**
     * user
     */

    socket.on("user:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
    });

    socket.on("user:update", (data?: { userId?: number; action?: string }) => {
      if (data && user?.id === data.userId && data.action === "diactivate") {
        localStorage.removeItem("creapp-store");
        window.location.href = "/connexion";
      } else if (
        data &&
        user &&
        user?.id === data.userId &&
        data.action === "data"
      ) {
        userQuery.mutate(user.id);
      }

      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-user"],
        refetchType: "active",
      });
    });

    socket.on("user:delete", (data?: { userId: number }) => {
      if (data && user?.id === data?.userId) {
        localStorage.removeItem("creapp-store");
        window.location.href = "/connexion";
      }
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
    });

    /**
     * vehicle
     */

    socket.on("vehicle:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
    });

    socket.on("vehicle:update", () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
    });

    socket.on("vehicle:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
    });

    /**
     * driver
     */

    socket.on("driver:new", () => {
      queryClient.invalidateQueries({
        queryKey: ["drivers"],
        refetchType: "active",
      });
    });

    socket.on("driver:update", () => {
      console.log("updating Drivers");

      queryClient.invalidateQueries({
        queryKey: ["drivers"],
        refetchType: "active",
      });
    });

    socket.on("driver:delete", () => {
      queryClient.invalidateQueries({
        queryKey: ["drivers"],
        refetchType: "active",
      });
    });

    return () => {
      socket.off("notification:new");
      socket.off("payment:new");
      socket.off("payment:update");
      socket.off("payment:delete");
      socket.off("request:new");
      socket.off("request:update");
      socket.off("request:delete");
      socket.off("transaction:new");
      socket.off("transaction:update");
      socket.off("transaction:delete");
      socket.off("command:new");
      socket.off("command:update");
      socket.off("command:delete");
      socket.off("purchaseOrder:new");
      socket.off("purchaseOrder:update");
      socket.off("purchaseOrder:delete");
      socket.off("quotation:new");
      socket.off("quotation:update");
      socket.off("quotation:delete");
      socket.off("provider:new");
      socket.off("provider:update");
      socket.off("provider:delete");
      socket.off("signatair:new");
      socket.off("signatair:update");
      socket.off("signatair:delete");
      socket.off("reception:new");
      socket.off("reception:update");
      socket.off("reception:delete");
      socket.off("category:new");
      socket.off("category:update");
      socket.off("category:delete");
      socket.off("project:new");
      socket.off("project:update");
      socket.off("project:delete");
      socket.off("bank:new");
      socket.off("bank:update");
      socket.off("bank:delete");
      socket.off("driver:new");
      socket.off("driver:update");
      socket.off("driver:delete");
      socket.off("user:new");
      socket.off("user:update");
      socket.off("user:delete");
      socket.off("vehicle:new");
      socket.off("vehicle:update");
      socket.off("vehicle:delete");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [queryClient, user]);

  return <>{children}</>;
}
