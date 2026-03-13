import React, { useState } from 'react';
import { X } from 'lucide-react';

const HistoryModal = ({ isOpen, type, onClose, onConfirm, availableMonths }) => {
  if (!isOpen) return null;

  const [selectedMonths, setSelectedMonths] = useState([]);

  const isDownload = type === 'download';
  const ctaColor = isDownload ? 'bg-accent-green hover:bg-[#16A34A]' : 'bg-accent-red hover:bg-[#DC2626]';
  const ctaText = isDownload ? 'Download Excel' : 'Delete Selected';
  const title = isDownload ? 'Download History' : 'Delete History';
  const WarningText = isDownload ? null : <p className="text-accent-red text-sm mb-4 font-semibold">⚠️ This action is permanent and cannot be undone.</p>;

  const toggleMonth = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handleConfirm = () => {
    if (selectedMonths.length === 0) return;
    onConfirm(selectedMonths);
    setSelectedMonths([]);
  };

  const handleClose = () => {
    setSelectedMonths([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden border border-border">
        
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={handleClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-muted text-sm mb-4">Select the months you want to include:</p>
          
          {WarningText}

          <div className="grid grid-cols-3 gap-3">
            {availableMonths.length === 0 ? (
              <p className="col-span-3 text-center text-text-muted py-8 bg-input rounded-lg border border-border">No history available</p>
            ) : availableMonths.map(month => {
              // month is YYYY-MM
              const [year, m] = month.split('-');
              const displayMonth = new Date(year, parseInt(m)-1).toLocaleString('default', { month: 'short', year: 'numeric' });
              
              const isSelected = selectedMonths.includes(month);
              
              return (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-accent-blue/20 border-accent-blue text-text-primary' 
                      : 'bg-input border-border text-text-muted hover:text-text-primary hover:border-text-muted'
                  }`}
                >
                  {displayMonth}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-input p-4 px-6 border-t border-border flex items-center justify-between gap-3">
          <span className="text-sm text-text-muted">{selectedMonths.length} selected</span>
          <div className="flex gap-3">
            <button 
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedMonths.length === 0}
              className={`${ctaColor} text-white px-6 py-2 rounded-md font-semibold transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {ctaText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;
