import { atom } from 'recoil';

export const balanceState = atom<string | null>({
  key: 'balanceState',
  default: null,
});
