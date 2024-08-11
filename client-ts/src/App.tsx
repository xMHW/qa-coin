import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import MetamaskHeader from './libs/components/MetamaskHeader';
import { useWeb3React } from '@web3-react/core';
import { connectors } from './libs/connectors';
import QnA from './libs/components/QnA';
import { Contract, ethers } from 'ethers';
import { QnAAddress, QnAAbi, QaCoinAddress, QaCoinAbi } from './Contracts';

const theme = createTheme();

function App() {
  const { activate, library } = useWeb3React();
  const [QnAcontract, setQnAContract] = useState<Contract | null>(null);
  const [QaCoinContract, setQaCoinContract] = useState<Contract | null>(null);

  useEffect(() => {
    const provider = window.localStorage.getItem('provider');
    if (provider) activate(connectors[provider]);
  }, [activate]);

  useEffect(() => {
    const web3Provider = library?.getSigner();
    const QnAcontract = new ethers.Contract(QnAAddress, QnAAbi, web3Provider);
    setQnAContract(QnAcontract);
    const QaCoinContract = new ethers.Contract(QaCoinAddress, QaCoinAbi, web3Provider);
    setQaCoinContract(QaCoinContract);
  }, [library]);

  return (
    <ThemeProvider theme={theme}>
      <MetamaskHeader QaCoinContract={QaCoinContract} />
      <Box sx={{ display: 'flex' }}>
        <QnA QnAcontract={QnAcontract} QaCoinContract={QaCoinContract} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
