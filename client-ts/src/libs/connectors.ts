import { InjectedConnector } from '@web3-react/injected-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';

const injected = new InjectedConnector({});

export const connectors: { [name: string]: AbstractConnector } = {
  injected: injected,
};
