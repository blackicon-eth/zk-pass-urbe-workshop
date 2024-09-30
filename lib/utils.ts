import TransgateConnect from "@zkpass/transgate-js-sdk";
import Web3 from "web3";
import { allocatorAddress } from "./constants";

const web3 = new Web3();

export interface TransGateResponse {
  allocatorAddress: string;
  allocatorSignature: string;
  //publicFields: [];
  publicFieldsHash: string;
  recipient: undefined;
  taskId: string;
  uHash: string;
  validatorAddress: string;
  validatorSignature: string;
}

/**
 * Starts the verification process
 * @param appId - The appid of the project created in dev center
 * @param schemaId - The schema id of the project created in dev center
 * @returns void
 */
export const verify = async (appId: string, schemaId: string) => {
  if (!appId || !schemaId) {
    console.log("Please provide both appId and schemaId");
    return;
  }
  console.log("verifying appId", appId);
  console.log("verifying schemaId", schemaId);
  try {
    // Create the connector instance
    const connector = new TransgateConnect(appId);

    // Check if the TransGate extension is installed
    // If it returns false, please prompt to install it from chrome web store
    const isAvailable = await connector.isTransgateAvailable();

    console.log("isAvailable", isAvailable);

    if (isAvailable) {
      // Launch the process of verification
      // This method can be invoked in a loop when dealing with multiple schemas
      const res = (await connector.launch(schemaId)) as TransGateResponse;

      console.log("res", res);

      // Verify the allocator signature
      const isAllocatorSignatureValid = validateAllocatorSignature(
        schemaId,
        res
      );
      console.log("isAllocatorSignatureValid", isAllocatorSignatureValid);

      if (!isAllocatorSignatureValid) {
        console.log("Allocator signature is invalid");
        return;
      }

      // Verify the validator signature
      const isValidatorSignatureValid = validateValidatorSignature(
        schemaId,
        res
      );
      console.log("isValidatorSignatureValid", isValidatorSignatureValid);

      if (!isValidatorSignatureValid) {
        console.log("Validator signature is invalid");
        return;
      }

      // verifiy the res onchain/offchain based on the requirement
    } else {
      console.log("Please install TransGate");
    }
  } catch (error) {
    console.log("transgate error", error);
  }
};

/**
 * Validates the allocator signature
 * @param schemaId - The schema id that was used to launch the TransGate verification process
 * @param transGateRes - The response from TransGate extension
 * @returns Whether the allocator signature is valid or not
 */
export const validateAllocatorSignature = (
  schemaId: string,
  transGateRes: TransGateResponse
): boolean => {
  const { taskId, allocatorSignature, validatorAddress } = transGateRes; //return by Transgate

  const taskIdHex = Web3.utils.stringToHex(taskId);
  const schemaIdHex = Web3.utils.stringToHex(schemaId);

  const encodeParams = web3.eth.abi.encodeParameters(
    ["bytes32", "bytes32", "address"],
    [taskIdHex, schemaIdHex, validatorAddress]
  );
  const paramsHash = Web3.utils.soliditySha3(encodeParams);
  if (!paramsHash) {
    return false;
  }
  const signedAllocatorAddress = web3.eth.accounts.recover(
    paramsHash,
    allocatorSignature
  );
  return signedAllocatorAddress === allocatorAddress;
};

/**
 * Validates the validator signature
 * @param schemaId - The schema id that was used to launch the TransGate verification process
 * @param transGate - The response from TransGate extension
 * @returns Whether the validator signature is valid or not
 */
export const validateValidatorSignature = (
  schemaId: string,
  transGateRes: TransGateResponse
): boolean => {
  const {
    taskId,
    uHash,
    publicFieldsHash,
    recipient,
    validatorAddress,
    validatorSignature,
  } = transGateRes; //return by Transgate

  const taskIdHex = Web3.utils.stringToHex(taskId);
  const schemaIdHex = Web3.utils.stringToHex(schemaId);

  const types = ["bytes32", "bytes32", "bytes32", "bytes32"];
  const values = [taskIdHex, schemaIdHex, uHash, publicFieldsHash];

  //If you add the wallet address as the second parameter when launch the Transgate
  if (recipient) {
    types.push("address");
    values.push(recipient);
  }

  const encodeParams = web3.eth.abi.encodeParameters(types, values);

  const paramsHash = Web3.utils.soliditySha3(encodeParams);
  if (!paramsHash) {
    return false;
  }
  const signedValidatorAddress = web3.eth.accounts.recover(
    paramsHash,
    validatorSignature
  );
  return signedValidatorAddress === validatorAddress;
};
