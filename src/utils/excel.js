import * as XLSX from 'xlsx';

export const exportHistoryToExcel = (transactionHistory, selectedMonths, username) => {
  // Filter history
  const filteredHistory = transactionHistory.filter(txn => {
    const txnMonth = txn.date.substring(0, 7);
    return selectedMonths.includes(txnMonth);
  });

  const toReceiveData = filteredHistory
    .filter(txn => txn.section === 'toReceive')
    .map(txn => ({
      Date: txn.date,
      Name: txn.name,
      Amount: txn.amount,
      'Action Type': txn.type.toUpperCase(),
      Note: txn.note
    }));

  const toPayData = filteredHistory
    .filter(txn => txn.section === 'toPay')
    .map(txn => ({
      Date: txn.date,
      Name: txn.name,
      Amount: txn.amount,
      'Action Type': txn.type.toUpperCase(),
      Note: txn.note
    }));

  const wb = XLSX.utils.book_new();

  // Create "To Receive" sheet
  const wsReceive = XLSX.utils.json_to_sheet(toReceiveData);
  XLSX.utils.book_append_sheet(wb, wsReceive, 'To Receive');

  // Create "To Pay" sheet
  const wsPay = XLSX.utils.json_to_sheet(toPayData);
  XLSX.utils.book_append_sheet(wb, wsPay, 'To Pay');

  // Download
  const filename = `${username}_history_${selectedMonths.join('_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};
