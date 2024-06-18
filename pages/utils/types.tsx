export type GuessGiverData = {
    concept1: string,
    concept2: string,
    targetPercent: number
}

export type GuesserData = {
    concept1: string,
    concept2: string,
}

export type GuesserSubmission = {
    guessedPercent: number
}

export type GuesserResults = {
    concept1: string,
    concept2: string,
    guessedPercent: number, 
    targetPercent: number
}

export type Game = {
    id: string, 
    concept1: string,
    concept2: string,
    targetPercent: number, 
    availableConceptList: ConceptPair[]
}

export type GamesFile = {
    games: Game[]
}

export type GameResponseData = {
    gameId: string
}

export type ConceptPair = {
    concept1: string, 
    concept2: string
}

export type ConceptsFile = {
    concepts: ConceptPair[]
}

export type ApiResultError = {
    errorMessage: string
}

export type Property = {
    propertyName: string,
    propertyValue: any 
}

export const supportedColors = ["blue", "green", "red", "yellow", "purple", "white", "brown"] as const;
export type SupportedColor = typeof supportedColors[number];

export type PlayerColors = {
    [name: string] : SupportedColor
}