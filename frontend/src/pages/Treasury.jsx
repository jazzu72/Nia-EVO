import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Treasury() {
  const transactions = [
    { id: 1, type: 'deposit', amount: 85000, source: '+17573399245', note: 'Deal closed', date: '2026-07-18' },
    { id: 2, type: 'withdraw', amount: 25000, destination: 'Contractor', note: 'Home inspection', date: '2026-07-17' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Treasury</h2>
        <p className="text-gray-400">Balance and transactions</p>
      </div>

      <div className="grid gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Available Balance</h3>
            </div>
            <p className="text-3xl font-bold">$85,000</p>
          </div>
        </div>

        {transactions.map((tx) => (
          <div key={tx.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {tx.type === 'deposit' ? (
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="font-medium">{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</p>
                <p className="text-sm text-gray-400">{tx.note}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
