import { CSSProperties } from "react"

type CellProps = {
    height: number, 
    width: number,

}




export default function Cell(props: CellProps) {

    const cellStyle: CSSProperties = {
        width: props.width,
        height: props.height,
        border: 10,
        borderColor: "black",
        borderWidth: 2,
        borderStyle: "solid",
        backgroundColor: "yellow",
        padding: 0,
        margin: 0,
    }


    return <div style={cellStyle}>
        
    </div>
}