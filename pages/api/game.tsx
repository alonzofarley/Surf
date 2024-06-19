import type { NextApiRequest, NextApiResponse } from 'next'
import {readFileWithType, writeToFile} from "../../utils/file";
import { ConceptPair, ConceptsFile, Game, GameResponseData, GamesFile } from '../../utils/types';
import {v4 as uuidv4} from 'uuid';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameResponseData>
) {

    if (req.method === 'GET') {
        if(req.query.gameId && req.query.nextRound){
            let { games: games } = await readFileWithType<GamesFile>("data/games.json");
            let game = games.find((game: Game) => game.id == req.query.gameId);
            if(game != undefined){  
                let nextConceptPair = game.availableConceptList.pop(); 
                if(nextConceptPair != undefined){
                    let randomPercentage = Math.floor(Math.random() * 100);
                    let updatedGame: Game = {
                        ...game, 
                        concept1: nextConceptPair.concept1, 
                        concept2: nextConceptPair.concept2, 
                        targetPercent: randomPercentage          
                    };
                    let updatedGames = games.map(_game => {
                        if(_game.id == req.query.gameId){
                            return updatedGame;
                        }
                        return _game;
                    })             
                    writeToFile("data/games.json", { games: updatedGames }, () => {});
                    res.status(200).json({ gameId: req.query.gameId as string })
                    return;
                }
                res.status(400);
                return;
            }
            res.status(400);
            return;
        }

        let { games: games } = await readFileWithType<GamesFile>("data/games.json");
        let { concepts: concepts } =  await readFileWithType<ConceptsFile>("data/concepts.json");

        let randomizedConcepts: ConceptPair[] = shuffleArray(concepts);
        let randomConceptPair = randomizedConcepts.pop();
        if(randomConceptPair != undefined){
            let randomPercentage = Math.floor(Math.random() * 100);
            let gameId = uuidv4();

            let newGame: Game = {
                id: gameId,
                concept1: randomConceptPair.concept1, 
                concept2: randomConceptPair.concept2, 
                targetPercent: randomPercentage, 
                availableConceptList: randomizedConcepts
            }

            games.push(newGame);

            writeToFile("data/games.json", { games: games }, () => {});

            res.status(200).json({ gameId: gameId })
        }

        
    }else if (req.method === 'POST'){
        
    } else {
        res.status(400);
    }
}


function shuffleArray(array: any[]) {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}