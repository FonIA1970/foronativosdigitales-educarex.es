import React from 'react';

interface SidebarProps {
  inventory: string[];
  currentQuest: string;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ inventory, currentQuest, isLoading }) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gray-800 p-6 border-l-2 border-gray-700 overflow-y-auto flex-shrink-0">
      <div className="sticky top-6">
        <h2 className="text-2xl font-bold text-amber-400 font-serif mb-4 border-b-2 border-amber-500/30 pb-2">Estado</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-300 mb-3">Misión Actual</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          ) : (
            <p className="text-gray-400 italic">{currentQuest || "Tu viaje aún no ha comenzado..."}</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-300 mb-3">Inventario</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-gray-700 rounded w-1/2"></div>
              <div className="h-5 bg-gray-700 rounded w-2/3"></div>
              <div className="h-5 bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : (
            <ul className="space-y-2">
              {inventory.length > 0 ? (
                inventory.map((item, index) => (
                  <li key={index} className="text-gray-400 bg-gray-900/50 px-3 py-2 rounded-md shadow-sm">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">Tus bolsillos están vacíos.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;