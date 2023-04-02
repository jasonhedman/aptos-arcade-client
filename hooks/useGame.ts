import {useCallback, useEffect, useState} from "react";

import {useWallet} from "@manahippo/aptos-wallet-adapter";

import {useUnityContext} from "react-unity-webgl";
import useOwnedNFTs from "@/hooks/useOwnedNFTs";
import {getCharacterEnumValueByCollectionIdHash} from "@/data/characters";

const useGame = () => {

    const [walletManagerActive, setWalletManagerActive] = useState<boolean>(false);

    const { account } = useWallet();

    const { ownedNFTs } = useOwnedNFTs();

    const {
        unityProvider,
        isLoaded,
        requestFullscreen,
        unload,
        addEventListener,
        removeEventListener,
        sendMessage
    } = useUnityContext({
        loaderUrl: "/build/AptosArena.loader.js",
        dataUrl: "/build/AptosArena.data",
        frameworkUrl: "/build/AptosArena.framework.js",
        codeUrl: "/build/AptosArena.wasm"
    });

    const handleWalletScreenLoad = useCallback(() => {
        setWalletManagerActive(true);
    }, []);

    const handleRankedCharacterSelectScreenLoad = useCallback(() => {
        const characterEnums = ownedNFTs
            .map((nft) => getCharacterEnumValueByCollectionIdHash(nft.collectionIdHash))
            .filter((characterEnum) => characterEnum > -1)
        // @ts-ignore
        const uniqueCharacterEnums = [...new Set(characterEnums)];
        uniqueCharacterEnums.forEach((characterEnum) => {
            sendMessage("RankedCharacterSelectManager", "AddCharacter", characterEnum);
        })
    }, [ownedNFTs, sendMessage]);

    useEffect(() => {
        addEventListener("WalletScreenLoad", handleWalletScreenLoad);
        addEventListener("RankedCharacterSelectScreenLoad", handleRankedCharacterSelectScreenLoad);

        return () => {
            removeEventListener("WalletScreenLoad", handleWalletScreenLoad);
            removeEventListener("RankedCharacterSelectScreenLoad", handleRankedCharacterSelectScreenLoad);
        };
    }, [addEventListener, handleRankedCharacterSelectScreenLoad, handleWalletScreenLoad, removeEventListener]);

    useEffect(() => {
        if(walletManagerActive && account?.address?.toString() !== undefined) {
            sendMessage("WalletManager", "SetAccountAddress", account.address.toString());
        }
    }, [account?.address, sendMessage, walletManagerActive]);

    return {
        unityProvider,
        isLoaded,
        requestFullscreen,
        unload,
    }
}

export default useGame