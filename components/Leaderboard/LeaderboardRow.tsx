import React from 'react';

import {Td, Tr} from "@chakra-ui/react";

import {LeaderboardRow as LeaderboardRowType} from "@/types/LeaderboardRow";

interface Props {
    leaderboardRow: LeaderboardRowType;
    rank: number;
}

const LeaderboardRow: React.FC<Props> = ({ leaderboardRow, rank }) => {

    const { name, wins, losses, eloRating } = leaderboardRow;

    return (
        <Tr>
            <Td>{rank}</Td>
            <Td>{name}</Td>
            <Td>{wins}</Td>
            <Td>{losses}</Td>
            <Td>{eloRating}</Td>
        </Tr>
    );
};

export default LeaderboardRow;
