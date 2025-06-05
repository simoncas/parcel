import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Map, Plane as Plant, ClipboardList, BarChart3, Settings, TreePine } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  return (
    <aside className={`w-64 bg-primary-700 text-white flex-shrink-0 flex flex-col ${className}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-600">
        <TreePine size={32} className="text-primary-100" />
        <div>
          <h1 className="font-bold text-xl">ForestNursery</h1>
          <p className="text-xs text-primary-200">Gestion de Pépinière</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Tableau de bord" />
          <NavItem to="/parcelles" icon={<Plant size={18} />} label="Parcelles" />
          <NavItem to="/activites" icon={<ClipboardList size={18} />} label="Activités" />
          <NavItem to="/carte" icon={<Map size={18} />} label="Carte" />
          <NavItem to="/rapports" icon={<BarChart3 size={18} />} label="Rapports" />
          <NavItem to="/parametres" icon={<Settings size={18} />} label="Paramètres" />
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-primary-600 text-xs text-primary-300">
        <p>© 2025 ForestNursery</p>
        <p>Version 1.0.0</p>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => `
          flex items-center gap-3 px-4 py-3 rounded-lg
          ${isActive 
            ? 'bg-primary-600 text-white' 
            : 'text-primary-200 hover:bg-primary-600 hover:text-white transition-colors duration-200'
          }
        `}
      >
        {({ isActive }) => (
          <>
            {icon}
            <span>{label}</span>
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute right-0 w-1 h-5 bg-white rounded-l-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};

export default Sidebar;