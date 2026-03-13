import { supabase } from '../supabase';

const getInitialData = () => ({
  toReceive: [],
  toPay: [],
  transactionHistory: []
});

export const ledgerService = {
  // Get all ledger data for a user from Supabase
  getData: async (uid) => {
    if (!uid) return getInitialData();
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select('*')
        .eq('user_id', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "Row not found" error
        console.error("Error fetching data:", error);
        return getInitialData();
      }
      
      if (data) {
        return {
          toReceive: data.to_receive || [],
          toPay: data.to_pay || [],
          transactionHistory: data.transaction_history || []
        };
      } else {
        // Doesn't exist yet, we don't necessarily need to create it until they save something
        return getInitialData();
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      return getInitialData();
    }
  },

  // Save all ledger data for a user to Supabase
  saveData: async (uid, ledgerData) => {
    if (!uid) return;
    try {
      const { error } = await supabase
        .from('ledgers')
        .upsert({ 
          user_id: uid, 
          to_receive: ledgerData.toReceive,
          to_pay: ledgerData.toPay,
          transaction_history: ledgerData.transactionHistory,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Error saving user data:", error);
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  // Add a new entry
  addEntry: async (uid, section, entry) => {
    const data = await ledgerService.getData(uid);
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      remaining: entry.amount,
      status: 'pending',
      history: []
    };
    
    data[section].push(newEntry);
    
    data.transactionHistory.push({
      id: crypto.randomUUID(),
      type: 'new_entry',
      section,
      name: entry.name,
      amount: entry.amount,
      note: entry.note || 'Added',
      date: entry.date,
      timestamp: new Date().toISOString()
    });
    
    await ledgerService.saveData(uid, data);
    return newEntry;
  },

  // Update/Edit an entry
  editEntry: async (uid, section, id, updates) => {
    const data = await ledgerService.getData(uid);
    const index = data[section].findIndex(e => e.id === id);
    if (index === -1) return;

    const oldEntry = data[section][index];
    
    let newRemaining = oldEntry.remaining;
    if (updates.amount !== undefined) {
      const diff = updates.amount - oldEntry.amount;
      newRemaining = oldEntry.remaining + diff;
      if (newRemaining < 0) newRemaining = 0;
    }

    const newStatus = newRemaining === 0 ? 'settled' : 'pending';

    data[section][index] = {
      ...oldEntry,
      ...updates,
      remaining: newRemaining,
      status: newStatus
    };

    data.transactionHistory.push({
      id: crypto.randomUUID(),
      type: 'update',
      section,
      name: updates.name || oldEntry.name,
      amount: updates.amount !== undefined ? updates.amount : oldEntry.amount,
      note: 'Edited entry details',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

    await ledgerService.saveData(uid, data);
  },

  // Settle an entry (partial or full)
  settleEntry: async (uid, section, id, paymentAmount, note) => {
    const data = await ledgerService.getData(uid);
    const index = data[section].findIndex(e => e.id === id);
    if (index === -1) return;

    const entry = data[section][index];
    const newRemaining = Math.max(0, entry.remaining - paymentAmount);
    
    data[section][index] = {
      ...entry,
      remaining: newRemaining,
      status: newRemaining === 0 ? 'settled' : 'pending'
    };

    let finalNote = note || (newRemaining === 0 ? 'Fully settled' : 'Partial payment');

    data.transactionHistory.push({
      id: crypto.randomUUID(),
      type: 'settle',
      section,
      name: entry.name,
      amount: paymentAmount,
      note: finalNote,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

    await ledgerService.saveData(uid, data);
  },

  // Delete transaction history
  deleteHistory: async (uid, selectedMonths) => {
    const data = await ledgerService.getData(uid);
    
    data.transactionHistory = data.transactionHistory.filter(txn => {
      const txnMonth = txn.date.substring(0, 7);
      return !selectedMonths.includes(txnMonth);
    });

    const filterEntries = (entry) => {
      const entryMonth = entry.date.substring(0, 7);
      return !selectedMonths.includes(entryMonth);
    };

    data.toReceive = data.toReceive.filter(filterEntries);
    data.toPay = data.toPay.filter(filterEntries);

    await ledgerService.saveData(uid, data);
  }
};
