import { atom } from 'recoil';

export const fetchBalanceState = atom<boolean>({
  key: 'fetchBalanceState',
  default: false,
});
