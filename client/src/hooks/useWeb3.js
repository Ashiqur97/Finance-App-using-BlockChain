import { useWeb3 } from '../contexts/Web3Context';

// Custom hook for easier access to Web3 context
export const useWeb3Hook = () => {
  return useWeb3();
};