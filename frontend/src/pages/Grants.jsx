import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function Grants() {
  const grants = [
    { name: 'NSF AI Research', amount: 500000, status: 'Submitted', date: '2026-07-10' },
    { name: 'Google AI for Good', amount: 250000, status: 'Draft', date: '2026-07-15' },
    { name: 'SBIR Phase I', amount: 150000, status: 'Reviewing', date: '2026-07-01' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Grants</h2>
        <p className="text-gray-400">Manage grant applications</p>
      </div>

      <div className="grid gap-4">
        {grants.map((grant, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{grant.name}</p>
                <p className="text-sm text-gray-400">${grant.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                grant.status === 'Submitted' ? 'bg-green-500/20 text-green-400' :
                grant.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {grant.status === 'Submitted' ? <CheckCircle className="inline w-3 h-3 mr-1" /> :
                 grant.status === 'Draft' ? <Clock className="inline w-3 h-3 mr-1" /> : null}
                {grant.status}
              </span>
              <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
