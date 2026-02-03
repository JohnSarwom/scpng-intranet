import { useState, useCallback, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementsSharePointService } from "@/services/announcementsSharePointService";
import { getGraphClient } from "@/services/graphService";
import { useToast } from "@/hooks/use-toast";

export function useNoticeBoard() {
  const { instance: msalInstance } = useMsal();
  const { toast } = useToast();
  const [service, setService] = useState<AnnouncementsSharePointService | null>(null);

  const initializeService = useCallback(async () => {
    if (service) return service;

    try {
      const graphClient = await getGraphClient(msalInstance);
      if (!graphClient) {
        throw new Error("Failed to initialize Graph client. Please ensure you are logged in.");
      }
      const announcementsService = new AnnouncementsSharePointService(graphClient);
      await announcementsService.initialize();
      setService(announcementsService);
      return announcementsService;
    } catch (err: unknown) {
      console.error("[useNoticeBoard] Service initialization failed:", err);
      const error = err instanceof Error ? err : new Error("Unknown error");
      toast({
        title: "SharePoint Connection Error",
        description: error.message || "Failed to connect to SharePoint. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [msalInstance, service, toast]);

  useEffect(() => {
    if (!service && msalInstance) {
      initializeService().catch(console.error);
    }
  }, [initializeService, service, msalInstance]);

  const {
    data: announcements = [],
    isLoading: loading,
    error,
    refetch: refreshAnnouncements
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }
      return currentService.getAnnouncements();
    },
    enabled: !!msalInstance,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    announcements,
    loading,
    error: error as Error | null,
    refresh: refreshAnnouncements,
  };
}
