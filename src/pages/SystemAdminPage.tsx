import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Zap, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { ConfirmModal } from '../components/ConfirmModal';

export const SystemAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    tables,
    triggers,
    cronJobs,
    selectedTable,
    tableData,
    loading,
    error,
    deleteModalOpen,
    rowToDelete,
    editModalOpen,
    rowToEdit,
    createModalOpen,
    fetchTables,
    fetchTriggers,
    fetchCronJobs,
    selectTable,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteRow,
    openEditModal,
    closeEditModal,
    saveRowEdit,
    openCreateModal,
    closeCreateModal,
    createRow
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'tables' | 'triggers' | 'cron'>('tables');
  const [editFormData, setEditFormData] = useState<any>({});
  const [createFormData, setCreateFormData] = useState<any>({});

  useEffect(() => {
    fetchTables();
    fetchTriggers();
    fetchCronJobs();
  }, [fetchTables, fetchTriggers, fetchCronJobs]);

  const currentTableSchema = tables.find(t => t.name === selectedTable);

  const handleEditChange = (colName: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [colName]: value }));
  };

  const handleCreateChange = (colName: string, value: string) => {
    setCreateFormData((prev: any) => ({ ...prev, [colName]: value }));
  };

  const handleOpenEdit = (row: any) => {
    setEditFormData({ ...row });
    openEditModal(row);
  };

  const handleOpenCreate = () => {
    if (!currentTableSchema) return;
    const initialForm: any = {};
    currentTableSchema.columns.forEach(col => {
      if (col.name === 'id') {
        initialForm[col.name] = `${currentTableSchema.name.slice(0, 4)}-${Date.now()}`;
      } else {
        initialForm[col.name] = '';
      }
    });
    setCreateFormData(initialForm);
    openCreateModal();
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white p-4 md:p-8 font-mono">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/genesis')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/10 hover:border-gold/30 text-gold transition-all"
            title="Вернуться к игре"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Database className="text-gold" size={24} />
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                SQLite Admin & System Architecture
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Управление базой данных, схема SQLite, триггеры и реестр крон-задач Node.js
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchTables();
              fetchTriggers();
              fetchCronJobs();
              if (selectedTable) selectTable(selectedTable);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs uppercase tracking-wider transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Обновить
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dashboard Mode Selector */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-2 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all ${
                activeTab === 'tables' ? 'bg-gold/20 border border-gold/40 text-gold font-bold' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <TableIcon size={16} />
                Таблицы SQLite ({tables.length})
              </div>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('triggers')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all ${
                activeTab === 'triggers' ? 'bg-gold/20 border border-gold/40 text-gold font-bold' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap size={16} />
                Триггеры БД ({triggers.length})
              </div>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('cron')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all ${
                activeTab === 'cron' ? 'bg-gold/20 border border-gold/40 text-gold font-bold' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Крон-Задачи Node ({cronJobs.length})
              </div>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Table List */}
          {activeTab === 'tables' && (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
                Список Таблиц
              </h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                {tables.map(t => (
                  <button
                    key={t.name}
                    onClick={() => selectTable(t.name)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs transition-all ${
                      selectedTable === t.name
                        ? 'bg-white/10 border border-gold/30 text-gold font-bold'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-zinc-400 border border-white/5">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs">
              Ошибка: {error}
            </div>
          )}

          {activeTab === 'tables' && selectedTable && (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Table Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                    <TableIcon size={20} />
                    {selectedTable}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Всего записей: {currentTableSchema?.count || 0} | Столбцов: {currentTableSchema?.columns.length || 0}
                  </p>
                </div>

                <button
                  onClick={handleOpenCreate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Plus size={16} />
                  Добавить Запись
                </button>
              </div>

              {/* Data Table View */}
              <div className="overflow-x-auto rounded-xl border border-white/10 custom-scrollbar max-h-[600px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-zinc-400">
                      {tableData.columns.map(col => (
                        <th key={col} className="p-3 font-semibold uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      <th className="p-3 font-semibold uppercase tracking-wider text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={tableData.columns.length + 1} className="p-8 text-center text-zinc-500">
                          Таблица пуста
                        </td>
                      </tr>
                    ) : (
                      tableData.rows.map((row, rIdx) => (
                        <tr key={row.id || rIdx} className="hover:bg-white/[0.02] transition-colors">
                          {tableData.columns.map(col => {
                            const val = row[col];
                            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                            return (
                              <td key={col} className="p-3 text-zinc-300 max-w-[200px] truncate" title={valStr}>
                                {valStr}
                              </td>
                            );
                          })}
                          <td className="p-3 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 hover:text-gold text-zinc-400 transition-all border border-white/5"
                              title="Редактировать запись"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(selectedTable, String(row.id))}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20"
                              title="Удалить запись"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SQLite Triggers Inspection Tab */}
          {activeTab === 'triggers' && (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                  <Zap size={20} />
                  SQLite Triggers (Встроенные Триггеры Базы Данных)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Триггеры SQLite автоматически выполняют серверную логику при изменении таблиц
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {triggers.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 border border-white/5 rounded-xl">
                    Триггеры в базе данных не обнаружены
                  </div>
                ) : (
                  triggers.map(t => (
                    <div key={t.name} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gold">{t.name}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-gold/10 text-gold border border-gold/20 uppercase">
                          Таблица: {t.tbl_name}
                        </span>
                      </div>
                      <pre className="p-3 bg-black/60 rounded-lg text-[11px] text-zinc-300 overflow-x-auto border border-white/5">
                        {t.sql}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Cron Jobs Registry Tab */}
          {activeTab === 'cron' && (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                  <Clock size={20} />
                  Реестр Крон-Задач (Background Node.js Cron Runner)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Фоновые процессы бэкенда Node.js для расписаний и пассивных обновлений SQLite
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cronJobs.map(job => (
                  <div key={job.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{job.name}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400 border border-green-500/30 font-bold">
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Расписание: <span className="text-gold">{job.schedule}</span> | Последний запуск: {job.last_run || 'Не запускалось'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400">Всего запусков:</span>
                      <p className="text-lg font-bold text-gold">{job.run_count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL (No window.confirm!) */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Подтверждение удаления строки"
        message={`Вы уверены, что хотите удалить запись с ID "${rowToDelete?.id}" из таблицы "${rowToDelete?.tableName}"? Это действие нельзя отменить.`}
        confirmText="Удалить Запись"
        onConfirm={confirmDeleteRow}
        onClose={closeDeleteModal}
        isLoading={loading}
      />

      {/* EDIT ROW MODAL */}
      <AnimatePresence>
        {editModalOpen && currentTableSchema && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-gold/30 rounded-2xl p-6 text-white max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <button
                onClick={closeEditModal}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                <Edit size={18} />
                Редактировать запись ({selectedTable})
              </h3>

              <div className="space-y-4">
                {currentTableSchema.columns.map(col => (
                  <div key={col.name} className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">{col.name} ({col.type})</label>
                    {col.name === 'id' ? (
                      <input
                        type="text"
                        disabled
                        value={editFormData[col.name] || ''}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-zinc-500 cursor-not-allowed"
                      />
                    ) : (
                      <textarea
                        rows={2}
                        value={editFormData[col.name] !== undefined ? editFormData[col.name] : ''}
                        onChange={e => handleEditChange(col.name, e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-gold outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 text-xs uppercase"
                >
                  Отмена
                </button>
                <button
                  onClick={() => saveRowEdit(editFormData)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Check size={16} />
                  Сохранить Изменения
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE ROW MODAL */}
      <AnimatePresence>
        {createModalOpen && currentTableSchema && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-gold/30 rounded-2xl p-6 text-white max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <button
                onClick={closeCreateModal}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                <Plus size={18} />
                Создать новую запись ({selectedTable})
              </h3>

              <div className="space-y-4">
                {currentTableSchema.columns.map(col => (
                  <div key={col.name} className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">{col.name} ({col.type})</label>
                    <textarea
                      rows={2}
                      value={createFormData[col.name] !== undefined ? createFormData[col.name] : ''}
                      onChange={e => handleCreateChange(col.name, e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 text-xs uppercase"
                >
                  Отмена
                </button>
                <button
                  onClick={() => createRow(createFormData)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-black font-bold text-xs uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Plus size={16} />
                  Создать Запись
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
