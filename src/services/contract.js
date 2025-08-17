import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS } from "../config/network";
import { Core_Protocol_ABI } from "../contractsABI/CoreProtocolABI";
import { PLAN_TYPES, PAYMENT_TYPES, POLICY_STATUS, CLAIM_STATUS } from "@/constant";

class ContractService {
    constructor() {
        this.contractAddress = null;
        this.contract = null;
    }

    // initialize contract with signer or provider
    initContract(signerOrProvider, withSigner = false) {

    }
}
