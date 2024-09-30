import TransgateConnect from "@zkpass/transgate-js-sdk";
import Web3 from "web3";
import { allocatorAddress } from "./constants";

const web3 = new Web3();

export interface TransGateResponse {
  allocatorAddress: `0x${string}`;
  allocatorSignature: `0x${string}`;
  publicFields: any[];
  publicFieldsHash: `0x${string}`;
  recipient?: `0x${string}`;
  taskId: string;
  uHash: `0x${string}`;
  validatorAddress: `0x${string}`;
  validatorSignature: `0x${string}`;
}

/**
 * Starts the verification process
 * @param appId - The app id of the app that is using the TransGate SDK
 * @param schemaId - The schema id that was used to launch the TransGate verification process
 * @returns An object containing the response from TransGate extension (or null if an error occurred) and a log message
 */
export const verify = async (
  appId: string,
  schemaId: string,
  recipient: `0x${string}` | undefined
): Promise<{ response: TransGateResponse | null; message: string }> => {
  try {
    // Create the connector instance
    const connector = new TransgateConnect(appId);

    // Check if the TransGate extension is installed
    // If it returns false, please prompt to install it from chrome web store
    const isAvailable = await connector.isTransgateAvailable();

    if (isAvailable) {
      // Launch the process of verification
      // This method can be invoked in a loop when dealing with multiple schemas
      const res = (await connector.launch(schemaId, recipient)) as TransGateResponse;

      // Verify the allocator signature
      const isAllocatorSignatureValid = validateAllocatorSignature(schemaId, res);
      if (!isAllocatorSignatureValid) {
        return {
          message: "Allocator signature is invalid",
          response: null,
        };
      }

      // Verify the validator signature
      const isValidatorSignatureValid = validateValidatorSignature(schemaId, res);
      if (!isValidatorSignatureValid) {
        return {
          message: "Validator signature is invalid",
          response: null,
        };
      }

      // If both signatures are valid, return the response
      return {
        message: "Verification successful",
        response: res,
      };
    } else {
      return {
        message: "Please install TransGate",
        response: null,
      };
    }
  } catch (error: any) {
    return {
      message: "TransGate error: " + error.message,
      response: null,
    };
  }
};

/**
 * Validates the allocator signature
 * @param schemaId - The schema id that was used to launch the TransGate verification process
 * @param transGateRes - The response from TransGate extension
 * @returns Whether the allocator signature is valid or not
 */
export const validateAllocatorSignature = (schemaId: string, transGateRes: TransGateResponse): boolean => {
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
  const signedAllocatorAddress = web3.eth.accounts.recover(paramsHash, allocatorSignature);
  return signedAllocatorAddress === allocatorAddress;
};

/**
 * Validates the validator signature
 * @param schemaId - The schema id that was used to launch the TransGate verification process
 * @param transGate - The response from TransGate extension
 * @returns Whether the validator signature is valid or not
 */
export const validateValidatorSignature = (schemaId: string, transGateRes: TransGateResponse): boolean => {
  const { taskId, uHash, publicFieldsHash, recipient, validatorAddress, validatorSignature } = transGateRes; //return by Transgate

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
  const signedValidatorAddress = web3.eth.accounts.recover(paramsHash, validatorSignature);
  return signedValidatorAddress === validatorAddress;
};
