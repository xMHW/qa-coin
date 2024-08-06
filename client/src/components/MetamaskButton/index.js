import React, {useState} from "react";
import { Button } from "@mui/material";

const MetamaskButton = ({connectWallet}) => {
    const [address, setAddress] = useState("");
    
    const handleConnectWallet = async () => {
        const signer = await connectWallet();
        const address = await signer.getAddress();
        setAddress(address);
    }
    
    return (
        <div>
        <Button onClick={handleConnectWallet}>Connect Wallet</Button>
        <p>Address: {address}</p>
        </div>
    )
}

export default MetamaskButton;