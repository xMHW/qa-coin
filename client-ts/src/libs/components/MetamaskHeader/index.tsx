import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Button } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../connectors';
import { Contract } from 'ethers';
import { useRecoilState } from 'recoil';
import { balanceState } from '../../../recoil/balanceState';
import { formatEther } from 'ethers/lib/utils';
import ProfileModal from '../ProfileModal';
import { fetchBalanceState } from '../../../recoil/fetchBalanceState';

interface MetamaskHeaderProps {
  QaCoinContract: Contract | null;
}

const MetamaskHeader = ({ QaCoinContract }: MetamaskHeaderProps) => {
  const { account, chainId, activate, active, deactivate } = useWeb3React();
  const [balance, setBalance] = useRecoilState(balanceState);
  const [fetchBalanceRequest, setFetchBalanceRequest] = useRecoilState(fetchBalanceState);
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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

  const truncateAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0,6)}...${address.slice(-4)}`
  }

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
      <AppBar position="static" sx={{ backgroundColor: '#938AF8'}}>
        <Toolbar sx={{justifyContent: 'space-between'}}>
          <Box component="img" src="/image/icon.png" alt="Icon" sx={{width: 60, height: 60}}/>
          <Button variant="outlined" sx={{color: 'white', borderColor: 'white', '&:hover': {backgroundColor: 'rgba(255, 255, 255, 0.1)'}, minWidth: '180px'}} onClick={account ? () => setModalOpen(true): handleConnectWallet}>
            {account ? truncateAddress(account): 'Connect Wallet'}
          </Button>
          <ProfileModal
            open={modalOpen}
            onClose={() => {
            setModalOpen(false);
            }}
            account={account}
            balance={balance}
            chainId={chainId}
            mintToken={mintToken}
            mintLoading={mintLoading}
            handleDisconnectWallet={handleDisconnectWallet}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MetamaskHeader;
