import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { SharePointExplorerService, SharePointList, SharePointColumn, SharePointItem } from '@/services/sharePointExplorerService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, Plus, Trash2, Database, Table as TableIcon, Settings, Search, Copy, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SharePointExplorer = () => {
    const { instance: msalInstance } = useMsal();
    const { toast } = useToast();

    // Services & State
    const [service, setService] = useState<SharePointExplorerService | null>(null);
    const [lists, setLists] = useState<SharePointList[]>([]);
    const [selectedList, setSelectedList] = useState<SharePointList | null>(null);
    const [columns, setColumns] = useState<SharePointColumn[]>([]);
    const [items, setItems] = useState<SharePointItem[]>([]);

    // Loading States
    const [isLoadingService, setIsLoadingService] = useState(true);
    const [isLoadingLists, setIsLoadingLists] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateList, setShowCreateList] = useState(false);
    const [newListName, setNewListName] = useState('');

    const [showAddItem, setShowAddItem] = useState(false);
    const [newItemData, setNewItemData] = useState<Record<string, any>>({});

    const [showEditItem, setShowEditItem] = useState(false);
    const [editingItem, setEditingItem] = useState<SharePointItem | null>(null);
    const [editItemData, setEditItemData] = useState<Record<string, any>>({});

    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnData, setNewColumnData] = useState({ name: '', type: 'text' });


    // Initialize Service
    useEffect(() => {
        const init = async () => {
            try {
                const graphClient = await getGraphClient(msalInstance);
                if (!graphClient) throw new Error('Failed to get Graph client');

                const site = await graphClient
                    .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                    .get();

                setService(new SharePointExplorerService(graphClient, site.id));
            } catch (error) {
                console.error('Failed to init SP service', error);
                toast({ title: "Initialization Failed", description: "Could not connect to SharePoint", variant: "destructive" });
            } finally {
                setIsLoadingService(false);
            }
        };
        init();
    }, [msalInstance]);

    // Load Lists
    useEffect(() => {
        if (!service) return;
        loadLists();
    }, [service]);

    const loadLists = async () => {
        if (!service) return;
        setIsLoadingLists(true);
        try {
            const allLists = await service.getAllLists();
            // Sort by name
            const sorted = allLists.sort((a, b) => a.displayName.localeCompare(b.displayName));
            console.log('✅ [SharePointExplorer] Loaded Lists:', sorted.map(l => l.displayName));
            setLists(sorted);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load lists", variant: "destructive" });
        } finally {
            setIsLoadingLists(false);
        }
    };

    // Load List Details (Columns & Items)
    useEffect(() => {
        if (!service || !selectedList) return;

        const loadDetails = async () => {
            setIsLoadingData(true);
            try {
                const [cols, data] = await Promise.all([
                    service.getColumns(selectedList.id),
                    service.getItems(selectedList.id)
                ]);

                // Filter out some system columns for cleaner view
                const systemCols = ['ContentType', 'Edit', 'Attachments', 'ItemChildCount', 'FolderChildCount'];
                const visibleCols = cols.filter(c => !c.hidden && !c.readOnly && !systemCols.includes(c.name));

                setColumns(visibleCols);
                setItems(data);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load list details", variant: "destructive" });
            } finally {
                setIsLoadingData(false);
            }
        };

        loadDetails();
    }, [selectedList, service]);

    const handleCreateList = async () => {
        if (!service || !newListName) return;
        try {
            await service.createList(newListName);
            toast({ title: "Success", description: `List ${newListName} created` });
            setShowCreateList(false);
            setNewListName('');
            loadLists();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create list", variant: "destructive" });
        }
    };

    const handleDeleteList = async (list: SharePointList) => {
        if (!service || !confirm(`Are you sure you want to delete ${list.displayName}? THIS CANNOT BE UNDONE.`)) return;
        try {
            await service.deleteList(list.id);
            toast({ title: "Success", description: "List deleted" });
            if (selectedList?.id === list.id) setSelectedList(null);
            loadLists();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete list", variant: "destructive" });
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!service || !selectedList || !confirm('Delete this item?')) return;
        try {
            await service.deleteItem(selectedList.id, itemId);
            toast({ title: "Success", description: "Item deleted" });
            // Refresh items
            const data = await service.getItems(selectedList.id);
            setItems(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
        }
    };

    const handleInitiateEdit = (item: SharePointItem) => {
        setEditingItem(item);
        setEditItemData({ ...item.fields });
        setShowEditItem(true);
    };

    const handleUpdateItem = async () => {
        if (!service || !selectedList || !editingItem) return;
        try {
            await service.updateItem(selectedList.id, editingItem.id, editItemData);
            toast({ title: "Success", description: "Item updated" });
            setShowEditItem(false);
            const data = await service.getItems(selectedList.id);
            setItems(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
        }
    };

    const handleAddItem = async () => {
        if (!service || !selectedList) return;
        try {
            await service.createItem(selectedList.id, newItemData);
            toast({ title: "Success", description: "Item added" });
            setShowAddItem(false);
            setNewItemData({});
            const data = await service.getItems(selectedList.id);
            setItems(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
        }
    };

    const handleAddColumn = async () => {
        if (!service || !selectedList || !newColumnData.name) return;
        try {
            const def: any = { name: newColumnData.name };
            if (newColumnData.type === 'text') def.text = {};
            if (newColumnData.type === 'number') def.number = { decimalPlaces: 'automatic' };
            if (newColumnData.type === 'dateTime') def.dateTime = { format: 'dateOnly' };
            if (newColumnData.type === 'boolean') def.boolean = {};

            await service.createColumn(selectedList.id, def);
            toast({ title: "Success", description: "Column added" });
            setShowAddColumn(false);
            setNewColumnData({ name: '', type: 'text' });

            // Refresh columns
            const cols = await service.getColumns(selectedList.id);
            setColumns(cols.filter(c => !c.hidden && !c.readOnly));
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to add column", variant: "destructive" });
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        if (!service || !selectedList || !confirm('Delete this column? Data may be lost.')) return;
        try {
            await service.deleteColumn(selectedList.id, columnId);
            toast({ title: "Success", description: "Column deleted" });
            const cols = await service.getColumns(selectedList.id);
            setColumns(cols.filter(c => !c.hidden && !c.readOnly));
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete column", variant: "destructive" });
        }
    };

    const handleCopySchema = () => {
        const schema = columns.map(c => ({
            name: c.name,
            displayName: c.displayName,
            type: c.type,
            required: c.required,
            hidden: c.hidden,
            readOnly: c.readOnly,
            // include specific type details if present
            ...(c.text ? { text: c.text } : {}),
            ...(c.number ? { number: c.number } : {}),
            ...(c.dateTime ? { dateTime: c.dateTime } : {}),
            ...(c.choice ? { choice: c.choice } : {}),
            ...(c.lookup ? { lookup: c.lookup } : {}),
        }));
        navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
        toast({ title: "Success", description: "Schema copied to clipboard" });
    };

    // Filtered Lists
    const filteredLists = lists.filter(l =>
        l.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoadingService) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6 h-[800px] border rounded-lg overflow-hidden bg-background">
            {/* Sidebar List Selector */}
            <div className="col-span-3 border-r bg-muted/10 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Database className="w-4 h-4" /> Lists ({lists.length})
                        </h3>
                        <Button variant="ghost" size="icon" onClick={loadLists} disabled={isLoadingLists}>
                            <RefreshCw className={`w-4 h-4 ${isLoadingLists ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search lists..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
                        <DialogTrigger asChild>
                            <Button className="w-full gap-2" variant="outline" size="sm">
                                <Plus className="w-4 h-4" /> Create New List
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New SharePoint List</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>List Name</Label>
                                <Input
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="My_New_List"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateList} disabled={!newListName}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
                    {filteredLists.map(list => (
                        <button
                            key={list.id}
                            onClick={() => setSelectedList(list)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group
                                ${selectedList?.id === list.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                        >
                            <span className="truncate" title={list.displayName}>{list.displayName}</span>
                            {selectedList?.id === list.id && (
                                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                            )}
                        </button>
                    ))}
                    {filteredLists.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                            No lists found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-9 flex flex-col h-full overflow-hidden">
                {selectedList ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-card">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {selectedList.displayName}
                                </h2>
                                <p className="text-muted-foreground text-sm flex gap-4 mt-1">
                                    <span>ID: {selectedList.id}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <TableIcon className="w-3 h-3" /> {items.length} Items
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs text-muted-foreground self-center mr-2">
                                    <a href={selectedList.webUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                        Open in SharePoint
                                    </a>
                                </span>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteList(selectedList)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete List
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="data" className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 pt-4 border-b shrink-0">
                                <TabsList>
                                    <TabsTrigger value="data">Data Content</TabsTrigger>
                                    <TabsTrigger value="schema">Schema & Columns</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Data Content */}
                            <TabsContent value="data" className="flex-1 overflow-hidden p-0 mt-0 flex flex-col min-h-0">
                                {isLoadingData ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="p-4 border-b flex justify-between bg-muted/5 shrink-0">
                                            <div className="text-sm text-muted-foreground">
                                                Showing top 50 items
                                            </div>
                                            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Item
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Item</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        {columns.filter(c => !c.readOnly && !c.hidden).map(col => (
                                                            <div key={col.id} className="grid grid-cols-4 items-center gap-4">
                                                                <Label className="text-right">{col.displayName}</Label>
                                                                <Input
                                                                    className="col-span-3"
                                                                    placeholder={col.type}
                                                                    onChange={(e) => setNewItemData({ ...newItemData, [col.name]: e.target.value })}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleAddItem}>Add Item</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="flex-1 overflow-y-auto min-h-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {columns.slice(0, 8).map(col => (
                                                            <TableHead key={col.id} className="whitespace-nowrap">
                                                                {col.displayName}
                                                            </TableHead>
                                                        ))}
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                                                                No items found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        items.map(item => (
                                                            <TableRow key={item.id}>
                                                                {columns.slice(0, 8).map(col => (
                                                                    <TableCell key={`${item.id}-${col.id}`} className="max-w-[200px] truncate" title={String(item.fields[col.name] || '')}>
                                                                        {typeof item.fields[col.name] === 'object'
                                                                            ? JSON.stringify(item.fields[col.name])
                                                                            : String(item.fields[col.name] || '')}
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleInitiateEdit(item)}>
                                                                        <Pencil className="w-4 h-4 text-blue-500" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Schema View */}
                            <TabsContent value="schema" className="flex-1 overflow-hidden p-0 mt-0 min-h-0 flex flex-col">
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-lg">List Columns</h3>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={handleCopySchema}>
                                                    <Copy className="w-4 h-4 mr-2" /> Copy Schema
                                                </Button>
                                                <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Plus className="w-4 h-4 mr-2" /> Add Column
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Add New Column</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Column Name (Internal)</Label>
                                                                <Input
                                                                    value={newColumnData.name}
                                                                    onChange={(e) => setNewColumnData({ ...newColumnData, name: e.target.value })}
                                                                    placeholder="UseNoSpaces"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Type</Label>
                                                                <Select
                                                                    value={newColumnData.type}
                                                                    onValueChange={(val) => setNewColumnData({ ...newColumnData, type: val })}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="text">Text (Single Line)</SelectItem>
                                                                        <SelectItem value="number">Number</SelectItem>
                                                                        <SelectItem value="dateTime">Date & Time</SelectItem>
                                                                        <SelectItem value="boolean">Yes/No</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={handleAddColumn} disabled={!newColumnData.name}>Create Column</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                        <div className="grid gap-4">
                                            {columns.map(col => (
                                                <Card key={col.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {col.displayName}
                                                            <Badge variant="outline" className="text-xs font-normal">
                                                                {col.name}
                                                            </Badge>
                                                            {col.required && <Badge className="text-xs">Required</Badge>}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Type: <span className="font-mono">{col.type}</span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" disabled={col.readOnly} onClick={() => handleDeleteColumn(col.id)}>
                                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Database className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Select a list to manage</h3>
                        <p>Choose a list from the sidebar or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
