import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../connectors';
import { Contract } from 'ethers';
import { useRecoilState } from 'recoil';
import { balanceState } from '../../../recoil/balanceState';
import { formatEther } from 'ethers/lib/utils';

interface MetamaskHeaderProps {
  QaCoinContract: Contract | null;
}

const MetamaskHeader = ({ QaCoinContract }: MetamaskHeaderProps) => {
  const { account, chainId, activate, active, deactivate } = useWeb3React();
  const [balance, setBalance] = useRecoilState(balanceState);
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
    try {
      const tx = await QaCoinContract.mintTokens();
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  };

  useEffect(() => {
    if (QaCoinContract && account) {
      const fetchBalance = async () => {
        try {
          const balance = await QaCoinContract.balanceOf(account);
          setBalance(formatEther(balance));
        } catch (e) {
          console.log(e);
          setBalance(null);
        }
      };
      fetchBalance();
    }
  }, [QaCoinContract, account, setBalance]);

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
            <Button color="inherit" onClick={mintToken}>
              Mint Token
            </Button>
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
