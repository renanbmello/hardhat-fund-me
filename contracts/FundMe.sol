// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/**
 * @title A contract for crowdfunding
 * @author Renan Mello
 * @notice This contract is to demo a semple contract 
 * @dev This implements pricefeeds as our library
 */

contract FundMe {
    //Type declarations 
    using PriceConverter for uint256;
    //State Variables 

    mapping(address => uint256) public s_addressToAmountFunded; 
    address[] public s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
/**
 * @notice this function funds the contract 
 * @dev this implements price feeds as our 
 */

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0;
         funderIndex < s_funders.length; 
         funderIndex++
         ){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWitdraw() public payable onlyOwner{
        address [] memory funders = s_funders;
        // maapins can't be um memory 
        for(uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
            ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
            }
            s_funders = new address[](0);

            (bool success, ) = i_owner.call{value: address(this).balance}("");
            require (success);

    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

}