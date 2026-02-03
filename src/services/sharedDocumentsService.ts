import { Client } from '@microsoft/microsoft-graph-client';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const LIST_NAME = 'Organizational_Documents';

export interface SharedDocument {
    id: string; // List Item ID
    name: string;
    webUrl: string;
    createdDateTime: string;
    size: number;
    category?: string;
    subCategory?: string;
    description?: string;
    tags?: string;
    createdBy: {
        user: {
            displayName: string;
            email: string;
        }
    };
    fileType?: string;
}

export const getSiteId = async (client: Client): Promise<string> => {
    const site = await client.api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`).get();
    return site.id;
};

export const fetchSharedDocuments = async (client: Client): Promise<SharedDocument[]> => {
    try {
        const siteId = await getSiteId(client);
        // Expand fields to get custom columns
        // We filter for content type 'Document' just in case, though in a Doc Lib everything is usually a doc or folder.
        // We select minimal fields to keep it light.
        const response = await client.api(`/sites/${siteId}/lists/${LIST_NAME}/items`)
            .expand('driveItem,fields')
            .filter("fields/ContentType eq 'Document'")
            .get();

        return response.value.map((item: any) => ({
            id: item.id,
            name: item.driveItem.name,
            webUrl: item.webUrl, // This links to the item properties usually. driveItem.webUrl links to file.
            // visual logic often prefers driveItem.webUrl for direct open.
            createdDateTime: item.createdDateTime,
            size: item.driveItem.size,
            category: item.fields.Category,
            subCategory: item.fields.SubCategory,
            description: item.fields.DocDescription,
            tags: item.fields.Tags,
            createdBy: item.createdBy,
            fileType: item.driveItem.name.split('.').pop()
        }));
    } catch (error) {
        console.error('Error fetching shared documents:', error);
        throw error;
    }
};

export const uploadSharedDocument = async (
    client: Client,
    file: File,
    metadata: { category: string; subCategory?: string; description?: string; tags?: string }
): Promise<void> => {
    try {
        const siteId = await getSiteId(client);

        // 1. Get Drive ID for the list
        const drive = await client.api(`/sites/${siteId}/lists/${LIST_NAME}/drive`).get();
        const driveId = drive.id;

        // 2. Upload File (Stream)
        // We use PUT for small files. For large files we'd need an upload session, but standard doc requirement usually implies typical office docs.
        const uploadUrl = `/sites/${siteId}/drives/${driveId}/root:/${file.name}:/content`;
        const uploadResponse = await client.api(uploadUrl).put(file);
        const driveItemId = uploadResponse.id;

        // 3. Get List Item associated with Drive Item
        const listItemResponse = await client.api(`/sites/${siteId}/drives/${driveId}/items/${driveItemId}/listItem`).get();
        const listItemId = listItemResponse.id;

        // 4. Update Metadata fields
        const fieldsToUpdate: any = {
            Category: metadata.category,
            DocDescription: metadata.description,
            Tags: metadata.tags
        };
        if (metadata.subCategory) fieldsToUpdate.SubCategory = metadata.subCategory;

        await client.api(`/sites/${siteId}/lists/${LIST_NAME}/items/${listItemId}/fields`).patch(fieldsToUpdate);
    } catch (error) {
        console.error('Error uploading shared document:', error);
        throw error;
    }
};

export const deleteSharedDocument = async (client: Client, id: string): Promise<void> => {
    try {
        const siteId = await getSiteId(client);
        // Delete List Item (which deletes the file in a doc lib)
        await client.api(`/sites/${siteId}/lists/${LIST_NAME}/items/${id}`).delete();
    } catch (error) {
        console.error('Error deleting shared document:', error);
        throw error;
    }
};
