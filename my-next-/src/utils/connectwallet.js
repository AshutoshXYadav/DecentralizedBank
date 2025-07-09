const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('No crypto wallet found. Please install it.');
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log('Connected address:', await signer.getAddress());
  } catch (error) {
    console.error('ConnectWallet error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
  }
};

