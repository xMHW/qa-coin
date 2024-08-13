import React from 'react';
import { Box, Button, Typography, Modal, IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopy from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    account: string | null | undefined;
    balance: string | null;
    chainId: number | undefined;
    mintToken: () => Promise<void>;
    mintLoading: boolean;
    handleDisconnectWallet: () => void;
};

const Circle: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="122" height="122" viewBox="0 0 122 122" fill="none">
        <circle cx="61" cy="61" r="61" fill="white"/>
    </svg>
)

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    bgcolor: '#938AF8',
    borderRadius: '24px',
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
};

const truncateAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0,6)}...${address.slice(-4)}`
}

const ProfileModal = ({open, onClose, account, balance, chainId, mintToken, mintLoading, handleDisconnectWallet}: ProfileModalProps) => {
    const handleCopy = () => {
        if (account) {
            navigator.clipboard.writeText(account);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'white'}}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Circle />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                    <Typography variant="h6" component="div">
                        {truncateAddress(account)}
                    </Typography>
                    <IconButton onClick={handleCopy} sx={{ ml: 1, color: 'white' }}>
                        <ContentCopy />
                    </IconButton>
                </Box>
                {balance !== '0.0' ? (
                    <Typography variant="subtitle1" sx={{color: '#D7D7D7'}}>
                        {balance} QAC
                    </Typography>
                ): account ? (
                    <LoadingButton
                        loading={mintLoading}
                        variant="outlined"
                        color="inherit"
                        onClick={mintToken}
                        sx={{ 
                            width: '50%', 
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        MINT TOKENS
                    </LoadingButton>
                ): null}
                <Box sx={{width: '90%', bgcolor: '#AEA8F5', mt: 5, p: 2, borderRadius: '10px', mb: 1}}>
                    Network Name: Hardhat
                </Box>
                <Box sx={{width: '90%', bgcolor: '#AEA8F5', p: 2, borderRadius: '10px', mb: 1}}>
                    Network ID: {chainId}
                </Box>
                <Button onClick={() => {handleDisconnectWallet(); onClose();}} startIcon={<LogoutIcon/>} sx={{width: '98%', bgcolor: '#AEA8F5', color: 'red', p: 1.5, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }}}>
                    Disconnect
                </Button>
            </Box>
        </Modal>
    )
};

export default ProfileModal;