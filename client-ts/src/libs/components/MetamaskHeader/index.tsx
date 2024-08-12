import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Typography } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../connectors';
import { Contract } from 'ethers';
import { useRecoilState } from 'recoil';
import { balanceState } from '../../../recoil/balanceState';
import { formatEther } from 'ethers/lib/utils';
import { fetchBalanceState } from '../../../recoil/fetchBalanceState';

interface MetamaskHeaderProps {
  QaCoinContract: Contract | null;
}

const MetamaskHeader = ({ QaCoinContract }: MetamaskHeaderProps) => {
  const { account, chainId, activate, active, deactivate } = useWeb3React();
  const [balance, setBalance] = useRecoilState(balanceState);
  const [fetchBalanceRequest, setFetchBalanceRequest] = useRecoilState(fetchBalanceState);
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const handleConnectWallet = () => {
    window.localStorage.setItem('provider', 'injected');
    activate(connectors.injected);
  };
  const handleDisconnectWallet = () => {
    window.localStorage.removeItem('provider');
    deactivate();
  };

  const mintToken = async () => {
    if (!QaCoinContract || !account) return;
    setMintLoading(true);
    const tx = await QaCoinContract.mintTokens();
    await tx.wait();
    setMintLoading(false);
  };

  useEffect(() => {
    if (mintLoading) return;
    if (QaCoinContract && account) {
      const fetchBalance = async () => {
        try {
          const rawBalance = await QaCoinContract.balanceOf(account);
          setBalance(formatEther(rawBalance));
        } catch (e) {
          console.error(e, 'Can not fetch balance');
          setBalance(null);
        }
        setFetchBalanceRequest(false);
      };
      fetchBalance();
    }
  }, [QaCoinContract, account, setBalance, mintLoading, fetchBalanceRequest, setFetchBalanceRequest]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {account ? (
            <Typography sx={{ mr: 2 }}>Connected account: {account}</Typography>
          ) : (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Button color="inherit" onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            </>
          )}
          {chainId ? <Typography sx={{ mr: 2 }}>Connected network: {chainId?.toString()}</Typography> : null}
          {balance !== '0.0' ? (
            <Typography>Balance: {balance}</Typography>
          ) : account ? (
            <LoadingButton loading={mintLoading} color="inherit" onClick={mintToken}>
              Mint Token
            </LoadingButton>
          ) : null}
          {active ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Button color="inherit" onClick={handleDisconnectWallet}>
                Disconnect
              </Button>
            </>
          ) : null}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MetamaskHeader;
