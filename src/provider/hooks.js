import { providers } from "ethers";
import { useMemo } from "react";

export function clienToProvider(client) {
    const { chain, transport } = client;
    const network  = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }

    if(transport.type === "fallback") {

        return new providers.FallbackProvider(
          transport.transports.map(
            ({ value }) => new providers.JsonRpcBatchProvider
            (value?.url, network)
          )  
        )
    }

}