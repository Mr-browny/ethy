//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

contract Transactions {
    uint256 transactionCount;

    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    // The memory here basically deals with the memory of that transaction, so it'll fetch the data from there
    // The receiver must be there as well as the amouont
    function addToBlockChain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount +=1;
        // Where the msg, is an object that houses the request a specific function in the blockchain
        // The remaining parameters are coming from the above parameters
        // The timestamp is generated from the blockchain itself
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));
        // from the code above, we are not currently transferring the amount or anything
        // We just adding it to the list, to make the transfer, we'd emit the transfer function
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    // The public first of all makes it accessible everywhere in the blockchain
    // The 'view returns' allow you to return a value with a certain data type
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}