import {useCallback, useEffect, useState} from "react";

import {useWallet} from "@aptos-labs/wallet-adapter-react";

import useAptosTransaction from "@/hooks/useAptosTransaction";

import {useAptos} from "@/contexts/AptosContext";

import {
    getHasPlayerMintedMeleeWeapon,
    getMeleeWeaponCollectionAddress,
    getMeleeWeaponData
} from "@/services/viewFunctions";
import {equipMeleeWeaponPayload, mintAndEquipMeleeWeapon} from "@/services/transactionBuilder";

import {meleeWeaponNames} from "@/data/meleeWeapons";

import {MeleeWeapon} from "@/types/MeleeWeapon";

const useMeleeWeapons = () => {

    let { provider } = useAptos();

    let { account } = useWallet();

    let { submitTransaction } = useAptosTransaction();


    const [hasPlayerMintedLoading, setHasPlayerMintedLoading] = useState(true);
    const [hasPlayerMintedMeleeWeapon, setHasPlayerMintedMeleeWeapon] = useState(false);

    const [meleeWeaponsLoading, setMeleeWeaponsLoading] = useState(true);
    const [meleeWeapons, setMeleeWeapons] = useState<MeleeWeapon[]>([]);

    const fetchPlayerHasMintedMeleeWeapon = useCallback(async () => {
        if(account?.address?.toString()) {
            const hasPlayerMintedMeleeWeapon = await getHasPlayerMintedMeleeWeapon(provider.aptosClient, account.address.toString());
            setHasPlayerMintedMeleeWeapon(hasPlayerMintedMeleeWeapon);
            setHasPlayerMintedLoading(false);
        }
    }, [account?.address, provider.aptosClient])

    useEffect(() => {
        fetchPlayerHasMintedMeleeWeapon();
    }, [fetchPlayerHasMintedMeleeWeapon])

    const fetchMeleeWeapons = useCallback(async () => {
        if(account?.address?.toString()) {
            const collectionAddress = await getMeleeWeaponCollectionAddress(provider.aptosClient);
            const tokens = await provider.indexerClient.getTokenOwnedFromCollectionAddress(
                account.address.toString(),
                collectionAddress
            );
            const meleeWeapons = await Promise.all(tokens.current_token_ownerships_v2.map((token) => {
                return getMeleeWeaponData(provider.aptosClient, token.storage_id)
            }))
            setMeleeWeapons(meleeWeapons.map(([power, type], index) => ({
                address: tokens.current_token_ownerships_v2[index].storage_id,
                weaponType: type,
                power: power,
                name: meleeWeaponNames[type - 1]
            })));
            setMeleeWeaponsLoading(false);
        }
    }, [account?.address, provider.aptosClient, provider.indexerClient])

    useEffect(() => {
        fetchMeleeWeapons();
    }, [fetchMeleeWeapons]);

    const mintMeleeWeapon = async () => {
        await submitTransaction(mintAndEquipMeleeWeapon, {
            title: "Melee weapon minted!",
        });
    }

    const equipMeleeWeapon = async (meleeWeaponAddress: string) => {
        await submitTransaction(equipMeleeWeaponPayload(meleeWeaponAddress), {
            title: "Melee weapon equipped!",
        });
    }

    return {
        mintMeleeWeapon,
        equipMeleeWeapon,
        hasPlayerMintedLoading,
        hasPlayerMintedMeleeWeapon,
        meleeWeaponsLoading,
        meleeWeapons
    }
}

export default useMeleeWeapons