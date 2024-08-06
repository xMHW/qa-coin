import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import MetamaskButton from './components/MetamaskButton';

function App() {
  const connectWallet = useCallback(async () => {
    try {
      if(typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        return signer;
      } else {
        alert("please install MetaMask")
      }
    } catch (error) {
      console.log(error);
    }
  },[])

  return (
    <div className="App">
      <MetamaskButton connectWallet={connectWallet} />
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
