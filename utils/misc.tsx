import { Property } from "./types";

export async function fetchWithType<T>(input: string, options?: RequestInit){
    let responseData = (options) ? await fetch(input, options) : await fetch(input);
    return responseData.json() as T;
}


export function scoreGuess(target: number, guess:number){
    let difference = Math.abs(target - guess);
    if(difference < 2){
        return 5;
    } else if (difference < 5){
        return 4;
    } else if (difference < 8){
        return 3;
    } else if (difference < 10){
        return 2;
    } else if (difference < 15){
        return 1;
    } else {
        return 0;
    }
} 



export const alignStates = (setState: any, state: any, properties: Property[]) => {
    let fixedState = {...state};
    let changed = false;
    properties.forEach(property => {
        if(property.propertyValue != state[property.propertyName]){
            fixedState[property.propertyName] = property.propertyValue;
            changed = true;
        }
    })
    if(changed){
        setState(fixedState);
        //console.log("Fix was made to state; Time to rerender")
        //console.log(state, fixedState, properties);
        return;
    }
    //console.log("No Fix Necessary")
}