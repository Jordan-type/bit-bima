import toast from "react-hot-toast";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const uploadToPinata = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: metadata.name || file.name,
      keyvalues: metadata.keyvalues || {},
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resData = await res.json();
    return {
      success: true,
      ipfsHash: resData.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    toast.error("Failed to upload file to IPFS");
    return {
      success: false,
      error: error.message,
    };
  }
};

export const uploadJSONToPinata = async (
  jsonData,
  filename = "metadata.json"
) => {
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: filename,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resData = await res.json();
    return {
      success: true,
      ipfsHash: resData.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    toast.error("Failed to upload metadata to IPFS");
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getFromIPFS = async (hash) => {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return null;
  }
};
