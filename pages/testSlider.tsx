import { useState } from "react";

type TestSliderProps = {
    onSubmit: () => void
}


//https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/

export default function TestSlider(props: TestSliderProps) {

    let [players, setPlayers] = useState(
        [
            {name: "alonzo", value: 20},
            {name: "john", value: 80}
        ]
    )

    // setInterval(() => {
    //     let s = [...players]
    //     s.forEach(player => {
    //         player.value = Math.floor(Math.random() * 100);
    //     })
    //     setPlayers(s);
    // }, 4000)

    return <div className="slider_container_container">
        <div className="slider_container">
            <label className="slider_firstLabel">First Concept</label>
            <input type="range" className="slider"/>
            <label className="slider_secondLabel">Second Concept</label>

            {players.map(player => {
                let colors = ["blue", "green", "red", "yellow", "purple", "white", "brown"];
                let color = colors[Math.floor(Math.random() * colors.length)]
                return <input className={"slider_background " + color} type="range" value={player.value} disabled/>
            })}    
        </div>
    </div>
}