import React, { useEffect, useState } from 'react';
import {ethers } from 'ethers';

/* 
    This is a popular Ethereum client library. 
    It allows you to interface with blockchains that implement the Ethereum API.
*/

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window; 
// Because of the metamask extension we added to our browser, 
// the browser window now has access to the ethereum. So we are destructuring them


/* 
    The below code allows us to get our ethereum contract from the blockchain
*/

const getEthereumContract = () => {
    const provider = new ethers.provider.web3Provider(ethereum)
    const signer = provider.getSigner();
    // The 3 ingredients we need to fecth our contracts includes the contractAddress, contractABI and the signer
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log({
        provider, signer, transactionContract
    })
}

/* 
    Below code is our context, every context provider, 
    needs to get one thing from the props, and must return the context
*/

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount ] = useState('');
    /* 
        This function is here to check if the wallet has connected to our application,
        But first, we need to check if ethereum exists, which was destructured from the browser window.
        Remmeber that if you install metamask extension, the window will now have access to the ethereum obj
        So if no ethereum exists, the we will alert to the user that he needs to install metamask
        else, we make an await call, to get the accounts available. i.e if the user has connected his account.
    */

   const checkForMetaMask = () => {
       // This code will detect the kinda browser the user is accessing this app with
       let userAgent = navigator.userAgent;
       let browserName;
       
       if(userAgent.match(/chrome|chromium|crios/i)){
           browserName = "chrome";
         }else if(userAgent.match(/firefox|fxios/i)){
           browserName = "firefox";
         }  else if(userAgent.match(/safari/i)){
           browserName = "safari";
         }else if(userAgent.match(/opr\//i)){
           browserName = "opera";
         } else if(userAgent.match(/edg/i)){
           browserName = "edge";
         }else{
           browserName="No browser detection";
         }
      var metaMaskExtUrl = '';
      if(!ethereum) {
          var res = window.confirm('You currently do not have MetaMask installed, would you like to install it now?');
          if(res) {
              switch (browserName) {
                  case 'chrome':
                      metaMaskExtUrl = 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en';
                      break;
                  case 'firefox':
                      metaMaskExtUrl = 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/';
                      break;
                  case 'safari':
                      metaMaskExtUrl = 'https://metamask.io/download/';
                      break;
                  case 'opera':
                      metaMaskExtUrl = 'https://metamask.io/download/';
                      break;
                  case 'edge':
                      metaMaskExtUrl = 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm?hl=en-US';
                      break;
                  default: 
                  metaMaskExtUrl = 'https://metamask.io/download/';
              }
              window.open(metaMaskExtUrl, "_blank");
          } else {
              alert('Sorry, you can\'t use this application.')
          }
          return
      }
   }
    const checkIfWalletIsConnected = async () => {
        // if(!ethereum) return alert('Please Install MetaMask');

        checkForMetaMask();

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log(accounts);
    }

    const connectWallet = async () => {
        try {
            checkForMetaMask();
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
            throw new Error('Oops!!! No Ehtereum Object')
        }
    }

    useEffect(() => {
        // checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{connectWallet}}>
            {/* From the below code, whatever is wrapped inside this Transaction.Provider, is going to be rendered, and will have access to the value attribute */}
            { children }
        </TransactionContext.Provider>
    );
}