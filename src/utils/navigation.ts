import { createContext, useContext } from 'react';

type NavigationContextType = {
  navigate: (screen: string) => void;
};

export const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {}
});

export const useNavigation = () => useContext(NavigationContext); 