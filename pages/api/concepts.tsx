import type { NextApiRequest, NextApiResponse } from 'next'
import {writeToFile, readFileWithType} from "../utils/file";
import { ConceptPair } from '../utils/types';

var fs = require('fs');
 
type ResponseData = {
  message: string
}
 
type RequestBody = {
    concepts?: ConceptPair[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    if (req.method === 'GET') {
        let data = await readFileWithType<any>("data/concepts.json");

        res.status(200).json(data);
    } else if (req.method === 'POST') {
        let body: RequestBody = req.body;

        if(body != null && body.concepts != undefined) {
            let conceptList = body.concepts;
            console.log(conceptList)
            
            writeToFile("data/concepts.json", {
                "concepts": conceptList
            }, () => {});
            
            res.status(200).send({message: "Success"});
        } else {
            console.error("No concepts - default")
            console.error(body)

            res.status(400).send({message: "No Concepts Submitted"});
        }
    } else {
        res.status(400).send({message: "Unsupported HTTP method"});
    }
}
