import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';

const SettleModal = ({ isOpen, entry, onClose, onConfirm }) => {
  if (!isOpen || !entry) return null;

  const [settleType, setSettleType] = useState('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    setError('');
    let amountToSettle = 0;

    if (settleType === 'full') {
      amountToSettle = entry.remaining;
    } else {
      amountToSettle = Number(partialAmount);
      if (!amountToSettle || amountToSettle <= 0) {
        return setError('Enter a valid amount');
      }
      if (amountToSettle > entry.remaining) {
        return setError(`Amount cannot exceed remaining balance (${formatCurrency(entry.remaining)})`);
      }
    }

    onConfirm(amountToSettle, note.trim() || undefined);
    setPartialAmount('');
    setSettleType('full');
    setNote('');
  };

  const handleClose = () => {
    setError('');
    setPartialAmount('');
    setSettleType('full');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden border border-border">
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-1">Settle Entry</h2>
          <p className="text-text-muted text-sm mb-6">Updating balance for <span className="font-semibold text-text-primary">{entry.name}</span></p>
          
          <div className="bg-input rounded-lg p-4 mb-6 border border-border flex justify-between items-center">
            <span className="text-text-muted text-sm font-medium">Remaining Balance</span>
            <span className="text-lg font-bold text-accent-teal">{formatCurrency(entry.remaining)}</span>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-input transition-colors">
              <input 
                type="radio" 
                name="settleType" 
                value="full"
                checked={settleType === 'full'}
                onChange={() => setSettleType('full')}
                className="w-4 h-4 text-accent-teal border-border bg-input focus:ring-accent-teal focus:ring-offset-card"
              />
              <span className="text-text-primary font-medium">Fully Settled</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-input transition-colors">
              <input 
                type="radio" 
                name="settleType" 
                value="partial"
                checked={settleType === 'partial'}
                onChange={() => setSettleType('partial')}
                className="w-4 h-4 text-accent-teal border-border bg-input focus:ring-accent-teal focus:ring-offset-card"
              />
              <span className="text-text-primary font-medium">Partial Payment</span>
            </label>

            {settleType === 'partial' && (
              <div className="pl-8 pt-2 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-text-muted text-xs font-medium mb-1.5 ml-1">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                  <input
                    type="number"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-8"
                    min="1"
                    max={entry.remaining}
                  />
                </div>
                {error && <p className="text-accent-red text-xs mt-2">{error}</p>}
              </div>
            )}
            
            <div className="pt-2">
              <label className="block text-text-muted text-xs font-medium mb-1.5 ml-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note about this settlement"
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-input p-4 px-6 border-t border-border flex items-center justify-end gap-3">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="bg-accent-teal hover:bg-[#0D9488] text-white px-6 py-2 rounded-md font-semibold transition-colors text-sm shadow-sm"
          >
            Confirm Update
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettleModal;
