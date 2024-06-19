import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResultError, Game, GamesFile, GuessGiverData, GuesserData, GuesserResults, GuesserSubmission } from '../../utils/types';
import { readFileWithType } from '../../utils/file';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GuessGiverData | GuesserData | ApiResultError>
) {
    const {
        query: { role, gameId },
        method,
        body
      } = req;

    if (method === 'GET') {
        let gameFile = await readFileWithType<GamesFile>("data/games.json")

        if(gameFile === undefined){
            res.status(400).send({errorMessage: "Game File could not be read."});
            return;
        }

        let game = gameFile.games?.find(g => g.id == gameId) as Game;
        if(game == undefined){
            res.status(400).send({errorMessage: "Game Id could not be found."});
            return;
        }

        if(role === "guesser"){
            let guesserData: GuesserData = {
                concept1: game.concept1,
                concept2: game.concept2
            }
            res.status(200).json(guesserData);
            return;
        } else if (role ==="guessGiver") {
            let guessGiverData: GuessGiverData = {
                concept1: game.concept1,
                concept2: game.concept2, 
                targetPercent: game.targetPercent
            }
            res.status(200).json(guessGiverData);
            return;
        } else {
            res.status(400).send({errorMessage: "Client role is invalid"});
            return;
        }
    }else if (method === 'POST'){
        if(role === "guesser"){
            let gameFile = await readFileWithType<GamesFile>("data/games.json")

            if(gameFile === undefined){
                res.status(400).send({errorMessage: "Game File could not be read."});
                return;
            }

            let game = gameFile.games?.find(g => g.id == gameId) as Game;
            if(game == undefined){
                res.status(400).send({errorMessage: "Game Id could not be found."});
                return;
            }

            let guesserSubmission: GuesserSubmission = JSON.parse(body);
            let guesserResults: GuesserResults = {
                concept1: game.concept1, 
                concept2: game.concept2, 
                guessedPercent: guesserSubmission.guessedPercent,
                targetPercent: game.targetPercent
            }
            res.status(200).json(guesserResults);
            return;
        }

    } else {
        res.status(400).send({errorMessage: "HTTP method not supported."});
        return;
    }
}

