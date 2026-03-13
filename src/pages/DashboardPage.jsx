import React, { useState, useEffect } from 'react';
import { ledgerService } from '../services/ledger';
import { formatCurrency } from '../utils/format';
import { exportHistoryToExcel } from '../utils/excel';
import { LogOut, Download, Trash2, Wallet } from 'lucide-react';
import EntryList from '../components/EntryList';
import SettleModal from '../components/SettleModal';
import HistoryModal from '../components/HistoryModal';

const DashboardPage = ({ user, onLogout }) => {
  const [data, setData] = useState({ toReceive: [], toPay: [], transactionHistory: [] });
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Modals state
  const [settleConfig, setSettleConfig] = useState({ isOpen: false, entry: null, section: null });
  const [historyConfig, setHistoryConfig] = useState({ isOpen: false, type: 'download' }); // type: 'download' | 'delete'
  
  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsSyncing(true);
    const cloudData = await ledgerService.getData(user.uid);
    setData(cloudData);
    setIsSyncing(false);
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // derived state
  const totalReceive = data.toReceive.reduce((sum, e) => sum + (e.remaining || 0), 0);
  const totalPay = data.toPay.reduce((sum, e) => sum + (e.remaining || 0), 0);
  const netBalance = totalReceive - totalPay;

  // Available months from history for the dropdown
  const availableMonths = [...new Set(data.transactionHistory.map(txn => txn.date.substring(0, 7)))].sort().reverse();

  // Handlers
  const handleAddEntry = async (section, entry) => {
    setIsSyncing(true);
    await ledgerService.addEntry(user.uid, section, entry);
    await loadData();
    showToast(`Added entry to ${section === 'toReceive' ? 'To Receive' : 'To Pay'}`);
  };

  const handleEditEntry = async (section, id, updates) => {
    setIsSyncing(true);
    await ledgerService.editEntry(user.uid, section, id, updates);
    await loadData();
    showToast('Entry updated');
  };

  const handleOpenSettle = (section, entry) => {
    setSettleConfig({ isOpen: true, entry, section });
  };

  const handleConfirmSettle = async (amount, note) => {
    setIsSyncing(true);
    setSettleConfig({ isOpen: false, entry: null, section: null });
    await ledgerService.settleEntry(user.uid, settleConfig.section, settleConfig.entry.id, amount, note);
    await loadData();
    showToast(`Successfully paid ${formatCurrency(amount)}`);
  };

  const handleConfirmHistoryAction = async (selectedMonths) => {
    if (historyConfig.type === 'download') {
      exportHistoryToExcel(data.transactionHistory, selectedMonths, user.email || user.uid);
      showToast('Excel file downloaded');
      setHistoryConfig({ isOpen: false, type: 'download' });
    } else {
      setIsSyncing(true);
      setHistoryConfig({ isOpen: false, type: 'download' });
      await ledgerService.deleteHistory(user.uid, selectedMonths);
      await loadData();
      showToast('History deleted for selected months');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-input rounded-lg flex items-center justify-center border border-border">
              <Wallet className="w-5 h-5 text-accent-blue" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary hidden sm:inline-block">LenDen</span>
            <span className="text-text-muted text-sm ml-2 hidden md:inline-block border-l border-border pl-4">
              Welcome, <strong className="text-text-primary">{user.username}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button 
              onClick={() => setHistoryConfig({ isOpen: true, type: 'download' })}
              className="btn-download"
              title="Download History"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline-block">Download</span>
            </button>
            <button 
              onClick={() => setHistoryConfig({ isOpen: true, type: 'delete' })}
              className="btn-delete"
              title="Delete History"
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline-block">Delete</span>
            </button>
            <button 
              onClick={onLogout}
              className="ml-2 bg-input hover:bg-border text-text-primary px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
          
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* Summary Bar */}
        <div className="card-container mb-8 flex items-center justify-between border-t-4 sm:border-t-0 sm:border-l-4 border-accent-blue">
          <div>
            <h2 className="text-text-muted text-sm font-medium uppercase tracking-wider mb-1">Net Balance</h2>
            <div className={`text-3xl font-bold ${netBalance > 0 ? 'text-accent-green' : netBalance < 0 ? 'text-accent-red' : 'text-text-primary'}`}>
              {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
            </div>
          </div>
          <div className="text-right text-sm text-text-muted">
            <p>To Receive: <span className="font-semibold text-text-primary">{formatCurrency(totalReceive)}</span></p>
            <p className="mt-1">To Pay: <span className="font-semibold text-text-primary">{formatCurrency(totalPay)}</span></p>
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="md:border-r border-border md:pr-8">
            <EntryList 
              title="To Receive" 
              section="toReceive" 
              entries={data.toReceive} 
              onAdd={(entry) => handleAddEntry('toReceive', entry)}
              onEdit={handleEditEntry}
              onUpdate={handleOpenSettle}
            />
          </div>

          <div className="md:pl-2">
            <EntryList 
              title="To Pay" 
              section="toPay" 
              entries={data.toPay} 
              onAdd={(entry) => handleAddEntry('toPay', entry)}
              onEdit={handleEditEntry}
              onUpdate={handleOpenSettle}
            />
          </div>

        </div>
      </main>

      {/* Modals */}
      <SettleModal 
        isOpen={settleConfig.isOpen} 
        entry={settleConfig.entry} 
        onClose={() => setSettleConfig({ isOpen: false, entry: null, section: null })}
        onConfirm={handleConfirmSettle}
      />

      <HistoryModal
        isOpen={historyConfig.isOpen}
        type={historyConfig.type}
        availableMonths={availableMonths}
        onClose={() => setHistoryConfig({ isOpen: false, type: 'download' })}
        onConfirm={handleConfirmHistoryAction}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 ${toast.isError ? 'bg-accent-red text-white' : 'bg-card border border-border text-text-primary'}`}>
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
