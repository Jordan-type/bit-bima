// services/pinata.ts
import toast from "react-hot-toast";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT as string | undefined;

export type PinataKeyvalues = Record<string, string | number | boolean>;

export type PinataMetadata = {
  name?: string;
  keyvalues?: PinataKeyvalues;
};

export type PinataOk = { success: true; ipfsHash: string; url: string };
export type PinataErr = { success: false; error: string };
export type PinataResponse = PinataOk | PinataErr;

export async function uploadToPinata(file: File, metadata: PinataMetadata = {}): Promise<PinataResponse> {
  try {
    if (!PINATA_JWT) throw new Error("Missing PINATA_JWT env");

    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: metadata.name || file.name,
      keyvalues: metadata.keyvalues || {},
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 0 });
    formData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const resData: { IpfsHash: string } = await res.json();
    return { success: true, ipfsHash: resData.IpfsHash, url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}` };
  } catch (error: any) {
    console.error("Error uploading to Pinata:", error);
    toast.error("Failed to upload file to IPFS");
    return { success: false, error: error?.message ?? "Unknown error" };
  }
}

export async function uploadJSONToPinata(jsonData: unknown, filename = "metadata.json"): Promise<PinataResponse> {
  try {
    if (!PINATA_JWT) throw new Error("Missing PINATA_JWT env");

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: { name: filename },
      }),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const resData: { IpfsHash: string } = await res.json();
    return { success: true, ipfsHash: resData.IpfsHash, url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}` };
  } catch (error: any) {
    console.error("Error uploading JSON to Pinata:", error);
    toast.error("Failed to upload metadata to IPFS");
    return { success: false, error: error?.message ?? "Unknown error" };
  }
}

export async function getFromIPFS<T = any>(hash: string): Promise<T | null> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return null;
  }
}
