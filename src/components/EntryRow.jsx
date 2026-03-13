import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/format';
import { Edit2, RefreshCw } from 'lucide-react';

const EntryRow = ({ entry, section, onEdit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entry.name);
  const [editAmount, setEditAmount] = useState(entry.amount);

  const isSettled = entry.status === 'settled';
  const isToReceive = section === 'toReceive';

  const borderColor = isToReceive ? 'border-l-accent-green' : 'border-l-accent-red';
  const amountColor = isToReceive ? 'text-accent-green' : 'text-accent-red';

  const handleSave = () => {
    onEdit(entry.id, {
      name: editName,
      amount: Number(editAmount)
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(entry.name);
    setEditAmount(entry.amount);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`bg-card border-l-4 ${borderColor} rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm`}>
        <input 
          type="text" 
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="input-field flex-1 min-w-[120px]"
        />
        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
          <input 
            type="number" 
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="input-field pl-8 w-full"
            min="0"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button onClick={handleSave} className="btn-add-green flex-1 sm:flex-none">Save</button>
          <button onClick={cancelEdit} className="bg-input text-text-muted hover:text-text-primary px-3 py-2 rounded-md font-semibold transition-colors text-sm flex-1 sm:flex-none">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border-l-4 ${isSettled ? 'border-l-border bg-settled-bg opacity-70' : borderColor} rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex flex-col flex-1 min-w-[150px]">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${isSettled ? 'text-text-muted line-through' : 'text-text-primary'} truncate max-w-[200px]`}>
            {entry.name}
          </span>
          {isSettled && <span className="text-[10px] font-bold uppercase tracking-wider text-settled-text bg-[#032e18] px-2 py-0.5 rounded-full">Settled</span>}
        </div>
        <span className="text-text-muted text-xs mt-1">{formatDate(entry.date)}</span>
        {entry.note && entry.note !== 'Added' && (
          <span className="text-text-muted text-xs mt-0.5 italic flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-border mr-1"></span>
            {entry.note}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end mr-2">
        <span className={`font-bold text-base ${isSettled ? 'text-text-muted' : amountColor}`}>
          {formatCurrency(entry.remaining !== undefined ? entry.remaining : entry.amount)}
        </span>
        {entry.remaining !== entry.amount && entry.remaining > 0 && (
          <span className="text-text-muted text-xs">of {formatCurrency(entry.amount)} total</span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
        <button 
          onClick={() => setIsEditing(true)} 
          className="btn-edit flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
          title="Edit"
          disabled={isSettled}
        >
          <Edit2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Edit</span>
        </button>
        <button 
          onClick={() => onUpdate(entry)} 
          className="btn-update flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
          title="Update / Settle"
          disabled={isSettled}
        >
          <RefreshCw className="w-3.5 h-3.5" /> <span className="sm:hidden">Update</span>
        </button>
      </div>
    </div>
  );
};

export default EntryRow;
