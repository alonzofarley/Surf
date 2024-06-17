import type { NextApiRequest, NextApiResponse } from 'next'
import {readFileWithType, writeToFile} from "../utils/file";
import { ConceptsFile, Game, GameResponseData, GamesFile } from '../utils/types';
import {v4 as uuidv4} from 'uuid';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameResponseData>
) {

    if (req.method === 'GET') {
        let { games: games } = await readFileWithType<GamesFile>("data/games.json");
        let { concepts: concepts } =  await readFileWithType<ConceptsFile>("data/concepts.json");

        let randomConceptPair = concepts[Math.floor(Math.random() * concepts.length)]
        let randomPercentage = Math.floor(Math.random() * 100);
        let gameId = uuidv4();

        let newGame: Game = {
            id: gameId,
            concept1: randomConceptPair.concept1, 
            concept2: randomConceptPair.concept2, 
            targetPercent: randomPercentage 
        }

        games.push(newGame);

        writeToFile("data/games.json", { games: games }, () => {});

        res.status(200).json({ gameId: gameId })
    }else if (req.method === 'POST'){
        
    } else {
        res.status(400);
    }
}

