import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Home, FileText, Wallet, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Real Estate', href: '/realestate', icon: Home },
  { name: 'Grants', href: '/grants', icon: FileText },
  { name: 'Treasury', href: '/treasury', icon: Wallet },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-dark">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🏰 Nia OS
          </h1>
          <p className="text-xs text-gray-400 mt-1">House of Jazzu</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:bg-card/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs font-bold">
              NJ
            </div>
            <div>
              <p className="text-sm font-medium">Nia Jazzu</p>
              <p className="text-xs text-gray-500">CEO</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
