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
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
    // The 3 ingredients we need to fecth our contracts includes the contractAddress, contractABI and the signer
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    // console.log({
    //     provider, signer, transactionContract
    // });
    return transactionContract;
}

/* 
    Below code is our context, every context provider, 
    needs to get one thing from the props, and must return the context
*/

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ transactions, setTransactions ] = useState([]);
    const [ transactionCount, setTransactionCount ] = useState(localStorage.getItem('transactionCount'));
    /*  
        Firstly, we'd need to get the form data from the client side 
        To get such data, we'd have the state defined here, with an empty object of the data to be received from the client side...
        Also, we'd create a handleChange function that'd enable us update/setFormData.
        In react, when you need to auto get the values from a form, React provides what's called
        prevState (previous state), then wrap the returned function in parenthesis (), bcus, we don't have one line of code, and we dont wanna use return and {}
        where we'd first spread the preState, and a square bracket notation of 'name'
        which was/is derived from the form field, this is the name given to the input fields in the form on the client side...
        using key-value mode, these values are added to the names given.
        PS: It is really important for the name from the form fields, to match what you've got in the state...
    */
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
    });
    const handleChange = (e, name) => {
        setFormData((preState) => ({...preState, [name]: e.target.value}));
    }
    const getAllTransactions = async () => {
        try {
            
            checkForMetaMask();
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                // This 10**18 gets us the formal eth amount we saw online...
                amount: parseInt(transaction.amount._hex) / (10**18)
            }))
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error)
            throw new Error('Oops!!! No Ehtereum Object')
        }
    }
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
        try {
            // if(!ethereum) return alert('Please Install MetaMask');
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if(accounts.length) {
                // Get all transactions
                console.log(`%c account: ${accounts}`, "color: red; font-size: 30px;")
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log('%c No Accounts Found!!!', "color: green; font-size: 40px;")
            }
        } catch (error) {
            console.log(error)
            throw new Error('Oops!!! No Ehtereum Object')
        }

        checkForMetaMask();


    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.log(error)
            throw new Error('Oops!!! No Ehtereum Object')
        }
    }

    const connectWallet = async () => {
        try {
            checkForMetaMask();
            // The method eth_requestAccounts, is used to request accounts in the browser
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
            throw new Error('Oops!!! No Ehtereum Object')
        }
    }

    const sendTransaction = async () => {
        try {
            checkForMetaMask();
            // Get data from the form on the client side...
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            // The ethers package provides us with utitilty functions that'll allow us convert the decimal number to GWEI
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    /* 
                        Every value used in ethereum is written in hex
                        Here we'd need to determine just how much eth we wanna spend as the gas fee.
                        Firstly, visit https://www.rapidtables.com/convert/number/hex-to-decimal.html,
                        copy and paste the 0x5208, to get the decimal value, then visit
                        https://eth-converter.com/, paste the decimal value in the Gwei input field,
                        as Gwei is a sub-unit of Ethereum, just like cent is to dollars.
                        This in turn, gets you the correct value in eth...
                    */
                    gas: '0x5208', // 21000 Gwei
                    // 
                    value: parsedAmount._hex // To get the hex value
                }]
            });
            // Remember when you console.logged getEthereumContract(), we had our .addToBlockchain() in it too...
            const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);
            // The transactionHash is a specific transaction ID
            setIsLoading(true);
            console.log(`Loading - ${transactionHash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());
            window.location.reload() // This reload is needed, so that the new value is updated on the UI;
        } catch (error) {
            console.log(error)
            alert(error.message)
            throw new Error('Oops!!! No Ehtereum Object')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, sendTransaction, handleChange, transactions, isLoading}}>
            {/* From the below code, whatever is wrapped inside this Transaction.Provider, is going to be rendered, and will have access to the value attribute */}
            { children }
        </TransactionContext.Provider>
    );
}