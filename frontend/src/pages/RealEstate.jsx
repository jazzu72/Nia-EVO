import { Home, DollarSign, Calendar } from 'lucide-react';

export default function RealEstate() {
  const properties = [
    { address: '123 Main St, Norfolk, VA', price: 85000, status: 'Inspection', date: '2026-07-20' },
    { address: '456 Oak Ave, Norfolk, VA', price: 75000, status: 'Negotiating', date: '2026-07-22' },
    { address: '789 Pine Ln, Norfolk, VA', price: 95000, status: 'Lead', date: '2026-07-25' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Real Estate</h2>
        <p className="text-gray-400">Active properties and deals</p>
      </div>

      <div className="grid gap-4">
        {properties.map((prop, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{prop.address}</p>
                <p className="text-sm text-gray-400">Status: {prop.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-medium text-green-400">${prop.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Est. offer</p>
              </div>
              <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30">
                View Deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
