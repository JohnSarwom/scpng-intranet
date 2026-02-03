import { Client } from '@microsoft/microsoft-graph-client';

export interface SharePointList {
    id: string;
    displayName: string;
    name: string;
    description: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    webUrl: string;
}

export interface SharePointColumn {
    id: string;
    name: string;
    displayName: string;
    description: string;
    type: string; // 'text', 'number', 'dateTime', 'choice', etc.
    required: boolean;
    hidden: boolean;
    readOnly: boolean;
    [key: string]: any; // for type-specific props
}

export interface SharePointItem {
    id: string;
    fields: Record<string, any>;
    createdDateTime: string;
    lastModifiedDateTime: string;
    webUrl: string;
}

export class SharePointExplorerService {
    private client: Client;
    private siteId: string;

    constructor(client: Client, siteId: string) {
        this.client = client;
        this.siteId = siteId;
    }

    // --- List Operations ---

    async getAllLists(): Promise<SharePointList[]> {
        let allLists: SharePointList[] = [];
        let nextLink = `/sites/${this.siteId}/lists`;

        while (nextLink) {
            const response = await this.client
                .api(nextLink)
                .select('id,displayName,name,description,createdDateTime,lastModifiedDateTime,webUrl')
                .get();

            allLists = [...allLists, ...response.value];
            nextLink = response['@odata.nextLink'];
        }

        return allLists;
    }

    async getList(listId: string): Promise<SharePointList> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}`)
            .get();
        return response;
    }

    async createList(displayName: string, template: string = 'genericList'): Promise<SharePointList> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName,
                list: { template }
            });
        return response;
    }

    async deleteList(listId: string): Promise<void> {
        await this.client
            .api(`/sites/${this.siteId}/lists/${listId}`)
            .delete();
    }

    // --- Column/Schema Operations ---

    async getColumns(listId: string): Promise<SharePointColumn[]> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/columns`)
            .get();

        return response.value.map((col: any) => {
            // Determine type key (Graph returns { text: {} } for text columns)
            const typeKey = Object.keys(col).find(key =>
                ['text', 'number', 'dateTime', 'choice', 'boolean', 'currency', 'personOrGroup', 'lookup'].includes(key)
            ) || 'unknown';

            return {
                id: col.id,
                name: col.name,
                displayName: col.displayName,
                description: col.description,
                type: typeKey,
                required: col.required || false,
                hidden: col.hidden || false,
                readOnly: col.readOnly || false,
                ...col[typeKey] // spread type specific props
            };
        });
    }

    async createColumn(listId: string, columnDef: any): Promise<SharePointColumn> {
        // columnDef should be like { name: 'MyCol', text: {} }
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/columns`)
            .post(columnDef);
        return response;
    }

    async deleteColumn(listId: string, columnId: string): Promise<void> {
        await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/columns/${columnId}`)
            .delete();
    }

    // --- Item Operations ---

    async getItems(listId: string): Promise<SharePointItem[]> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .expand('fields')
            .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
            .top(50) // basic pagination limit for now
            .get();

        return response.value;
    }

    async createItem(listId: string, fields: Record<string, any>): Promise<SharePointItem> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .post({ fields });
        return response;
    }

    async updateItem(listId: string, itemId: string, fields: Record<string, any>): Promise<SharePointItem> {
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}`)
            .patch({ fields });
        return response;
    }

    async deleteItem(listId: string, itemId: string): Promise<void> {
        await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}`)
            .delete();
    }
}
