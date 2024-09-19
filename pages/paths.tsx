import Cell from "@/components/paths/cell";
import Peg from "@/components/paths/peg";
import test from "node:test";
import { CSSProperties } from "react";
import { Col, Container, Row } from "react-bootstrap";
import '../styles/paths.css'

const cellHeight = 50;
const cellWidth = 50;

const Blank = () => {
    return <td className="blank"></td>;
  };
  
  const Square = () => {
    return (
      <td className="square-cell">
        <div className="square"></div>
      </td>
    );
  };
  
  const Circle = () => {
    return (
      <td className="circle-cell">
        <div className="circle"></div>
      </td>
    );
  };
  
  const TableComponent = () => {
    const rows = 7;
    const cols = 7;
  
    const renderCell = (row: number, col: number) => {
      if (row % 2 === 0) {
        return col % 2 === 0 ? <Circle key={col} /> : <Blank key={col} />;
      } else {
        return col % 2 === 0 ? <Blank key={col} /> : <Square key={col} />;
      }
    };
  
    return (
      <table className="custom-table">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => renderCell(rowIndex, colIndex))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };


export default function Paths() {
    return <TableComponent />
}
//     const placeholder = [
//         [1, 2, 3], 
//         [4, 5, 6], 
//         [7, 8, 9]
//     ]

    


//     type Cell = "cell";
//     type Peg = "peg";
//     type Blank = "blank";
//     type Tile = Cell | Peg | Blank
//     let tiles: Tile[][] = [
//         ["peg", "blank", "peg", "blank", "peg", "blank", "peg"],

//         ["blank", "cell", "blank", "cell", "blank", "cell", "blank"],
//         ["peg", "blank", "peg", "blank", "peg", "blank", "peg"],
//         ["blank", "cell", "blank", "cell", "blank", "cell", "blank"],
//         ["peg", "blank", "peg", "blank", "peg", "blank", "peg"],
//         ["blank", "cell", "blank", "cell", "blank", "cell", "blank"],

//         ["peg", "blank", "peg", "blank", "peg", "blank", "peg"],

//     ]

//     const colStyle: CSSProperties = {
//         padding: 0,
//         margin: 2,
//         height: cellHeight, 
//         width: cellWidth,
//         flex: 'none'
//     }

//     const containerStyle: CSSProperties = {
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         gap: 10,
//         flexDirection: 'row'
//     }

//     const rowStyle: CSSProperties = {
//         //display: "flex",
//         // justifyContent: "center",
//         // alignItems: "center",
//         // gap: 10,
//         border: 10,
//         borderStyle: 'solid', 
//         borderColor: 'gray', 
//     }

//     let pegStyle = {
        
//     }   

//     let blankStyle = {
        
//     }

//     let testContainer2 = <>
//         <div style={containerStyle}>
//             {tiles.map((row, rowIdx) => {
//               return <div style={rowStyle}>
//                 {row.map((tile) => {
//                     switch(tile){
//                         case("blank"):
//                             return <div style={blankStyle}>
//                                 <div></div>
//                             </div>
//                         case("cell"):
//                             return <div>
//                                 <Cell width={cellWidth} height={cellHeight}></Cell>
//                             </div>
//                         case("peg"):
//                             return <div style={pegStyle}>
//                                 <Peg width={cellWidth/2} height={cellHeight/2}></Peg>
//                             </div>
//                     }
//                 })}
//               </div>  
//             })}
//         </div>
//     </>

//     return <>
//         {testContainer2}
//     </>
// }


