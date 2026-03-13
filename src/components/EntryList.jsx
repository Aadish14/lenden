import React, { useState } from 'react';
import EntryRow from './EntryRow';

const EntryList = ({ title, section, entries, onAdd, onEdit, onUpdate }) => {
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  
  const isToReceive = section === 'toReceive';
  const headerColor = isToReceive ? 'text-accent-green' : 'text-accent-red';
  const buttonClass = isToReceive ? 'btn-add-green' : 'btn-add-red';

  const totalRemaining = entries.reduce((sum, entry) => sum + (entry.remaining || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newAmount || newAmount <= 0) return;

    onAdd({
      name: newName,
      amount: Number(newAmount),
      note: newNote.trim() || undefined,
      date: new Date().toISOString().split('T')[0]
    });

    setNewName('');
    setNewAmount('');
    setNewNote('');
  };

  // Sort entries: pending first, then settled
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.status === 'settled' && b.status !== 'settled') return 1;
    if (a.status !== 'settled' && b.status === 'settled') return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold flex items-center gap-2 ${headerColor}`}>
          {isToReceive ? '💰 To Receive' : '🔴 To Pay'}
        </h2>
        <div className="bg-card px-3 py-1 rounded-full border border-border text-sm font-bold shadow-sm">
          ₹{totalRemaining.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="card-container mb-6 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              placeholder="Person's name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field flex-1 min-w-[120px]"
            />
            <div className="relative w-full sm:w-32 flex-shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
              <input
                type="number"
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="input-field pl-8"
                min="1"
              />
            </div>
            <button type="submit" className={`${buttonClass} w-full sm:w-auto flex-shrink-0 hidden sm:block`}>
              + Add
            </button>
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              placeholder="Note (Optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input-field flex-1"
            />
            <button type="submit" className={`${buttonClass} w-full sm:hidden`}>
              + Add
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {sortedEntries.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-text-muted">
            No entries yet. Add one above!
          </div>
        ) : (
          sortedEntries.map(entry => (
            <EntryRow 
              key={entry.id} 
              entry={entry} 
              section={section} 
              onEdit={(id, updates) => onEdit(section, id, updates)}
              onUpdate={(e) => onUpdate(section, e)} // pass section and entry to trigger Modal
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EntryList;
