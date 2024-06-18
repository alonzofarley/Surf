// var fs = require('fs');
import fs from "fs";
import { readFile } from 'fs/promises';

export const writeToFile = (target: string, data: any, callback: any) => {
    fs.writeFile (target, JSON.stringify(data), callback);
}

export async function readFileWithType<T>(target: string){
    let data = JSON.parse(await readFile(target, "utf8"));
    return data as T;
}