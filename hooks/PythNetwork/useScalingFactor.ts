import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { determineVotingPowerType } from "@hooks/queries/governancePower";
import useSelectedRealmPubkey from "@hooks/selectedRealm/useSelectedRealmPubkey";
import { PythClient } from "@pythnetwork/staking";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAsync } from "react-async-hook";
import { useQuery } from "@tanstack/react-query";


export default function useScalingFactor(): number {
    const realm = useSelectedRealmPubkey()
    const { connection } = useConnection()
    const { result: plugin } = useAsync(
        async () =>
            realm && determineVotingPowerType(connection, realm, 'community'),
        [connection, realm]
    )

    const { data: scalingFactor } = useQuery(["pyth-scaling-factor"],
        async (): Promise<number> => {
            const pythClient = await PythClient.connect(connection, {} as NodeWallet)
            return pythClient.getScalingFactor()
        }, { enabled: plugin == "pyth" })

    if (plugin == "pyth") {
        return scalingFactor || 1
    } else {
        return 1
    }
}

