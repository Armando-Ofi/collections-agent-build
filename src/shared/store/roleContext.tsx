import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface RoleContextType {
  role: number;
  setRole: (role: number) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<number>(1);
  const navigate = useNavigate();
  const location = useLocation();

  const setRole = (newRole: number) => {
    const oldRole = role;
    setRoleState(newRole);
    
    // Si el rol cambia y no estamos en overview, navegar a overview
    if (oldRole !== newRole && location.pathname !== '/' && location.pathname !== '/overview') {
      navigate('/');
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};