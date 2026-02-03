import { Client } from "@microsoft/microsoft-graph-client";
import { IAnnouncement } from "../types";

const SITE_PATH = "/sites/scpngintranet";
const SITE_DOMAIN = "scpng1.sharepoint.com";
const LIST_NAME = "Announcements";

interface SharePointAnnouncementItem {
  id: string;
  fields: {
    id: string;
    Title: string;
    Content: string;
    // SharePoint "Single line of text" columns return strings.
    // We relax the type to string to handle user's setup.
    Category: string;
    // User defined "IsPinned" as "Single line of text", so it might come back as "Yes"/"No" or "true"/"false" string.
    IsPinned: boolean | string;
    ExpiryDate?: string;
    SourceEmail?: string;
    Author?: { Title: string };
    Created: string;
  };
}

function transformAnnouncement(item: SharePointAnnouncementItem): IAnnouncement {
  const fields = item.fields;

  // Helper to parse boolean from various string formats or boolean
  const parseBoolean = (value: boolean | string | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (!value) return false;
    const normalized = value.toLowerCase().trim();
    return normalized === 'yes' || normalized === 'true' || normalized === '1';
  };

  // Helper to validate/normalize category
  const parseCategory = (value: string): "Announcement" | "Event" | "Update" | "Alert" => {
    const validCategories = ["Announcement", "Event", "Update", "Alert"];
    // Capitalize first letter to match expected types if possible, or fallback to "Announcement"
    // This handles case sensitivity issues from manual text entry
    const normalized = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Announcement";
    return validCategories.includes(normalized)
      ? (normalized as "Announcement" | "Event" | "Update" | "Alert")
      : "Announcement";
  };

  return {
    id: item.id,
    title: fields.Title,
    content: fields.Content,
    category: parseCategory(fields.Category),
    isPinned: parseBoolean(fields.IsPinned),
    expiryDate: fields.ExpiryDate ? new Date(fields.ExpiryDate) : undefined,
    sourceEmail: fields.SourceEmail,
    author: fields.Author?.Title,
    createdDate: new Date(fields.Created),
  };
}

export class AnnouncementsSharePointService {
  private client: Client;
  private siteId: string = "";
  private listId: string = "";

  constructor(client: Client) {
    this.client = client;
  }

  async initialize(): Promise<void> {
    try {
      const site = await this.client.api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`).get();
      this.siteId = site.id;

      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .filter(`displayName eq '${LIST_NAME}'`)
        .get();

      if (lists.value.length === 0) {
        throw new Error(
          `Announcements list '${LIST_NAME}' not found. Please create it in SharePoint first.`
        );
      }

      this.listId = lists.value[0].id;
    } catch (error) {
      console.error("Error initializing announcements service:", error);
      throw error;
    }
  }

  async getAnnouncements(): Promise<IAnnouncement[]> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand("fields")
        .top(100)
        .get();

      const items = response.value
        .map(transformAnnouncement)
        .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());

      return items;
    } catch (error) {
      console.error("Error fetching announcements from SharePoint:", error);
      throw error;
    }
  }
}

export async function getAnnouncements(client: Client): Promise<IAnnouncement[]> {
  const service = new AnnouncementsSharePointService(client);
  return service.getAnnouncements();
}
