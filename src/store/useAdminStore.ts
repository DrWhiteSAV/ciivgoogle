import { create } from 'zustand';

export interface TableInfo {
  name: string;
  count: number;
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
}

export interface TriggerInfo {
  name: string;
  tbl_name: string;
  sql: string;
}

export interface CronJobInfo {
  id: string;
  name: string;
  schedule: string;
  status: string;
  last_run: string | null;
  run_count: number;
  created_at: string;
}

interface AdminStoreState {
  tables: TableInfo[];
  triggers: TriggerInfo[];
  cronJobs: CronJobInfo[];
  selectedTable: string | null;
  tableData: { columns: string[]; rows: any[] };
  loading: boolean;
  error: string | null;

  // Modal states for CRUD operations
  deleteModalOpen: boolean;
  rowToDelete: { tableName: string; id: string } | null;

  editModalOpen: boolean;
  rowToEdit: any | null;
  
  createModalOpen: boolean;

  // Actions
  fetchTables: () => Promise<void>;
  fetchTriggers: () => Promise<void>;
  fetchCronJobs: () => Promise<void>;
  selectTable: (tableName: string) => Promise<void>;
  openDeleteModal: (tableName: string, id: string) => void;
  closeDeleteModal: () => void;
  confirmDeleteRow: () => Promise<void>;
  
  openEditModal: (row: any) => void;
  closeEditModal: () => void;
  saveRowEdit: (updatedData: any) => Promise<void>;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  createRow: (newData: any) => Promise<void>;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  tables: [],
  triggers: [],
  cronJobs: [],
  selectedTable: null,
  tableData: { columns: [], rows: [] },
  loading: false,
  error: null,

  deleteModalOpen: false,
  rowToDelete: null,

  editModalOpen: false,
  rowToEdit: null,

  createModalOpen: false,

  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/db/tables');
      if (!res.ok) throw new Error('Failed to fetch tables');
      const tables: TableInfo[] = await res.json();
      set({ tables, loading: false });
      if (tables.length > 0 && !get().selectedTable) {
        get().selectTable(tables[0].name);
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTriggers: async () => {
    try {
      const res = await fetch('/api/db/triggers');
      if (!res.ok) throw new Error('Failed to fetch triggers');
      const triggers: TriggerInfo[] = await res.json();
      set({ triggers });
    } catch (err: any) {
      console.error('Error fetching triggers:', err);
    }
  },

  fetchCronJobs: async () => {
    try {
      const res = await fetch('/api/db/cron-jobs');
      if (!res.ok) throw new Error('Failed to fetch cron jobs');
      const cronJobs: CronJobInfo[] = await res.json();
      set({ cronJobs });
    } catch (err: any) {
      console.error('Error fetching cron jobs:', err);
    }
  },

  selectTable: async (tableName: string) => {
    set({ selectedTable: tableName, loading: true, error: null });
    try {
      const res = await fetch(`/api/db/tables/${tableName}`);
      if (!res.ok) throw new Error(`Failed to fetch data for ${tableName}`);
      const data = await res.json();
      set({ tableData: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  openDeleteModal: (tableName: string, id: string) => {
    set({ deleteModalOpen: true, rowToDelete: { tableName, id } });
  },

  closeDeleteModal: () => {
    set({ deleteModalOpen: false, rowToDelete: null });
  },

  confirmDeleteRow: async () => {
    const { rowToDelete, selectedTable } = get();
    if (!rowToDelete) return;

    set({ loading: true });
    try {
      const res = await fetch(`/api/db/tables/${rowToDelete.tableName}/${rowToDelete.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete row');

      set({ deleteModalOpen: false, rowToDelete: null });
      if (selectedTable) {
        await get().selectTable(selectedTable);
        await get().fetchTables();
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  openEditModal: (row: any) => {
    set({ editModalOpen: true, rowToEdit: { ...row } });
  },

  closeEditModal: () => {
    set({ editModalOpen: false, rowToEdit: null });
  },

  saveRowEdit: async (updatedData: any) => {
    const { selectedTable, rowToEdit } = get();
    if (!selectedTable || !rowToEdit || !rowToEdit.id) return;

    set({ loading: true });
    try {
      const res = await fetch(`/api/db/tables/${selectedTable}/${rowToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to save row changes');

      set({ editModalOpen: false, rowToEdit: null });
      await get().selectTable(selectedTable);
      await get().fetchTables();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  openCreateModal: () => {
    set({ createModalOpen: true });
  },

  closeCreateModal: () => {
    set({ createModalOpen: false });
  },

  createRow: async (newData: any) => {
    const { selectedTable } = get();
    if (!selectedTable) return;

    set({ loading: true });
    try {
      const res = await fetch(`/api/db/tables/${selectedTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Failed to create row');

      set({ createModalOpen: false });
      await get().selectTable(selectedTable);
      await get().fetchTables();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
