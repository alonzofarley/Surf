import { useEffect, useState } from "react";
import { ClientSideUserView } from "../utils/socketTypes";
import { PlayerColors, SupportedColor, supportedColors } from "../utils/types";

type PercentSliderInputProps = {
    value: number, 
    disabled?: boolean, 
    onChange?: (event:any) => void, 
    players: ClientSideUserView[], 
    colors: PlayerColors, 
    concepts: {concept1: string, concept2: string}
}

export function PercentSliderInput(props: PercentSliderInputProps) {
    let colors = props.colors;

    if(Number.isNaN(props.value) || props.value == undefined){
        return <div>Error, no value</div>
    }

    //Establish defaults in case optional props not provided
    let isDisabled = props.disabled ?? false;  
    let onChange = props.onChange ?? (() => {});

    return <div className="slider_container_container">
    <div className="slider_container">
        <label className="slider_firstLabel">{props.concepts.concept1}</label>
        <input type="range" className="slider" value={props.value} disabled={isDisabled} onChange={onChange}/>
        <label className="slider_secondLabel">{props.concepts.concept2}</label>

        {props.players.map((player, i) => {
            let color = colors[player.name];
            return <input key={i} className={"slider_background " + color} type="range" value={player.guess} disabled/>
        })}    
    </div>
</div>

    // return <input style={{"width": 400}} type="range" value={props.value} disabled={isDisabled} onChange={onChange}/>
}