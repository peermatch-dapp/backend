import { ethers } from "ethers";
import {
  JWT_SECRET,
  LIGHTHOUSE_API_KEY,
  NONCE_TEMPLATE,
  SIGNER_PRIVATE_KEY,
} from "./config";
import multer from "multer";
import lighthouse from "@lighthouse-web3/sdk";
import jwt from "jsonwebtoken";

const storage = multer.memoryStorage();

export const multerUploader = multer({ storage: storage });

export function getNonceMessage(nonce: string) {
  return NONCE_TEMPLATE.replace("%", nonce);
}

export function generateNonce() {
  const options = "ABCDEDFGHIJKLMNOPQRSTUVWXYZ";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    if (i !== 0 && i % 8 === 0) {
      nonce += "-";
    }
    nonce += options.charAt(Math.floor(Math.random() * options.length));
  }
  return nonce;
}

export function generateJWTToken(address: string) {
  return jwt.sign({ username: address }, JWT_SECRET);
}

export function verifyJWTToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifySignature(
  data: string,
  signature: string,
  address: string
) {
  let signer;
  try {
    signer = ethers.utils.verifyMessage(data, signature);
  } catch (err) {
    return false;
  }
  return signer.toLowerCase() === address.toLowerCase();
}

export async function signMessage(hash: any) {
  const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY);
  const hashBytes = ethers.utils.arrayify(hash);
  const signature = await signer.signMessage(hashBytes);
  return signature;
}

export async function uploadToIPFS(file: Express.Multer.File) {
  const res = await lighthouse.uploadBuffer(
    file.buffer,
    LIGHTHOUSE_API_KEY,
    file.mimetype
  );
  return res.data;
}

export async function uploadJSONtoIPFS(obj: any) {
  const res = await lighthouse.uploadBuffer(
    Buffer.from(JSON.stringify(obj), "utf-8"),
    LIGHTHOUSE_API_KEY,
    "application/json"
  );
  return res.data;
}
