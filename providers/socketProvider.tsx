"use client";

import { getSocket } from "@/lib/sockets";
import { queryKeys } from "@/lib/query-keys";
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

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        socket.connect();
      }
    });

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

    const invalidatePayments = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.depenses(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.depensesStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.ticketsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatureRequests(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatureRequestsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardPaidData(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvisionnement(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.voltPendingCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingDepenseCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentsToSignCount,
        refetchType: "active",
      });
    };

    socket.on("payment:new", invalidatePayments);
    socket.on("payment:update", invalidatePayments);
    socket.on("payment:delete", invalidatePayments);

    /**
     * Requests
     */

    socket.on("request:new", (data: { userId?: number }) => {
      if (data && data.userId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.requestsUser(data.userId),
          refetchType: "active",
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.requestsUser(),
          refetchType: "active",
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequests(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequestsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsForApproval(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsForApprovalStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardGraph(),
        refetchType: "active",
      });
    });

    socket.on("request:update", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequests(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequestsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsForApproval(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsForApprovalStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingRequestApprovalsCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequestsCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.usableRequestsCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsUser(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardGraph(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments(),
        refetchType: "active",
      });
      // Invalidate current user's requests
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.requestsUser(user.id),
          refetchType: "active",
        });
      }
    });

    socket.on("request:delete", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequests(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allRequestsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsForApproval(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(),
        refetchType: "active",
      });
    });

    /**
     * transaction
     */

    const invalidateTransactions = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvisionnement(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingApprovalsTransactionsCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingToSignTransfersCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingTransfersCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.depenses(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.depensesStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.ticketsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatureRequests(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatureRequestsStats(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardPaidData(),
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvisionnement(),
        refetchType: "active",
      });
    };

    socket.on("transaction:new", invalidateTransactions);
    socket.on("transaction:update", invalidateTransactions);
    socket.on("transaction:delete", invalidateTransactions);

    /**
     * commandrequests
     */

    const invalidateCommands = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.commands,
        refetchType: "active",
      });
    };

    socket.on("command:new", invalidateCommands);

    socket.on("command:update", () => {
      invalidateCommands();
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.requestsUser(user.id),
          refetchType: "active",
        });
      }
    });

    socket.on("command:delete", invalidateCommands);

    /**
     * purchaseOrder
     */

    const invalidatePurchaseOrders = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrdersPendingCount,
        refetchType: "active",
      });
    };

    socket.on("purchaseOrder:new", invalidatePurchaseOrders);
    socket.on("purchaseOrder:update", () => {
      console.log("Purchasing");
      invalidatePurchaseOrders();
    });
    socket.on("purchaseOrder:delete", invalidatePurchaseOrders);

    /**
     * bank
     */

    const invalidateBanks = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banks,
        refetchType: "active",
      });
    };

    socket.on("bank:new", invalidateBanks);
    socket.on("bank:update", invalidateBanks);
    socket.on("bank:delete", invalidateBanks);

    /**
     * quotation
     */

    socket.on("quotation:new", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotations,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotationRequests,
        refetchType: "active",
      });
    });

    socket.on("quotation:update", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotations,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotationRequests,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pendingCommandRequestsCount,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.commands,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotationToAssignCount,
        refetchType: "active",
      });
    });

    socket.on("quotation:delete", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotations,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotationRequests,
        refetchType: "active",
      });
    });

    /**
     * provider
     */

    const invalidateProviders = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.providers,
        refetchType: "active",
      });
    };

    socket.on("provider:new", invalidateProviders);
    socket.on("provider:update", invalidateProviders);
    socket.on("provider:delete", invalidateProviders);

    /**
     * project
     */

    const invalidateProjects = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects,
        refetchType: "active",
      });
    };

    socket.on("project:new", invalidateProjects);
    socket.on("project:update", invalidateProjects);
    socket.on("project:delete", invalidateProjects);

    /**
     * category
     */

    const invalidateCategories = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories,
        refetchType: "active",
      });
    };

    socket.on("category:new", invalidateCategories);
    socket.on("category:update", invalidateCategories);
    socket.on("category:delete", invalidateCategories);

    /**
     * signatair
     */

    const invalidateSignataires = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.signataires,
        refetchType: "active",
      });
    };

    socket.on("signatair:new", invalidateSignataires);
    socket.on("signatair:update", invalidateSignataires);
    socket.on("signatair:delete", invalidateSignataires);

    /**
     * reception
     */

    const invalidateReceptions = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.receptions,
        refetchType: "active",
      });
    };

    socket.on("reception:new", invalidateReceptions);
    socket.on("reception:update", invalidateReceptions);
    socket.on("reception:delete", invalidateReceptions);

    /**
     * user
     */

    socket.on("user:new", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
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
        queryKey: queryKeys.users,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requestsUser(),
        refetchType: "active",
      });
      if (data?.userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user(data.userId),
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.signature(data.userId),
          refetchType: "active",
        });
      }
    });

    socket.on("user:delete", (data?: { userId: number }) => {
      if (data && user?.id === data?.userId) {
        localStorage.removeItem("creapp-store");
        window.location.href = "/connexion";
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
        refetchType: "active",
      });
    });

    /**
     * vehicle
     */

    const invalidateVehicles = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles,
        refetchType: "active",
      });
    };

    socket.on("vehicle:new", invalidateVehicles);
    socket.on("vehicle:update", invalidateVehicles);
    socket.on("vehicle:delete", invalidateVehicles);

    /**
     * driver
     */

    socket.on("driver:new", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers,
        refetchType: "active",
      });
    });

    socket.on("driver:update", () => {
      console.log("updating Drivers");
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers,
        refetchType: "active",
      });
    });

    socket.on("driver:delete", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers,
        refetchType: "active",
      });
    });

    /**
     * invoice
     */

    const invalidateInvoices = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices,
        refetchType: "active",
      });
    };

    socket.on("invoice:new", invalidateInvoices);
    socket.on("invoice:update", invalidateInvoices);
    socket.on("invoice:delete", invalidateInvoices);

    /**
     * service
     */

    const invalidateServices = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.services,
        refetchType: "active",
      });
    };

    socket.on("service:new", invalidateServices);
    socket.on("service:update", invalidateServices);
    socket.on("service:delete", invalidateServices);

    /**
     * department
     */

    const invalidateDepartments = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departmentList,
        refetchType: "active",
      });
    };

    socket.on("department:new", invalidateDepartments);
    socket.on("department:update", invalidateDepartments);
    socket.on("department:delete", invalidateDepartments);

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
      socket.off("invoice:new");
      socket.off("invoice:update");
      socket.off("invoice:delete");
      socket.off("service:new");
      socket.off("service:update");
      socket.off("service:delete");
      socket.off("department:new");
      socket.off("department:update");
      socket.off("department:delete");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [queryClient, user]);

  return <>{children}</>;
}
