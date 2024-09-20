import { CSSProperties } from "react"

type PegProps = {
    height: number, 
    width: number,

}




export default function Peg(props: PegProps) {

    const pegStyle: CSSProperties = {
        width: props.width,
        height: props.height,
        border: 10,
        borderColor: "black",
        borderWidth: 2,
        borderStyle: "solid",
        backgroundColor: "grey",
        borderRadius: "50%",
        padding: 0,
        margin: 0,
    }


    return <div style={pegStyle}>
        
    </div>
}