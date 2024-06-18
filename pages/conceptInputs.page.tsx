import { useState } from "react";

type ConceptInputsProps = {
    onSubmit: () => void
}

export function ConceptInputs(props: ConceptInputsProps) {

    let [rows, setRows] = useState(3);
    let [firstConcepts, setFirstConcepts] = useState(Array(rows).fill(""));
    let [secondConcepts, setSecondConcepts] = useState(Array(rows).fill(""));

    const handleInputValue = (index: number, first: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if(first){
            let newFirstConcepts = [...firstConcepts];
            newFirstConcepts[index] = e.target.value;
            setFirstConcepts(newFirstConcepts);
        } else {
            let newSecondConcepts = [...secondConcepts];
            newSecondConcepts[index] = e.target.value;
            setSecondConcepts(newSecondConcepts);
        }
    };

    const onSubmitConcepts = async (event: React.FormEvent) => {
        event.preventDefault();

        let conceptList = firstConcepts.filter((v) => {
            return v != "" && v != undefined;
        }).map((fv, i) => {
            let sv = secondConcepts[i];
            return {
                concept1: fv, 
                concept2: sv
            }
        })

        let body = {
            concepts: conceptList
        }

        const response: Response = await fetch("api/concepts", {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)}
        );
        
        if(response.status == 200){
            props.onSubmit();
        }

        return response;
    }

    const addRow = () => {
        setRows(rows + 1);
        setFirstConcepts([...firstConcepts, ""])
        setSecondConcepts([...secondConcepts, ""])
    }

    const createInputs = () => {
        let formInputs = [];
        for(let i = 0; i < rows; i++){
            formInputs.push(
                <div key={i}>
                    <label>
                    First Concept
                    <input type="text" value={firstConcepts[i]} onChange={handleInputValue(i, true)} />
                    </label>
                    <label>
                    Second Concept
                    <input type="text" value={secondConcepts[i]} onChange={handleInputValue(i, false)} />
                    </label>
                </div>
            )
        }
        return formInputs;
    }

    return <div>
        <form onSubmit={onSubmitConcepts}>
            {createInputs()}
            <input type="submit" value="Submit" />
        </form>
        <button onClick={addRow}>Add Row</button>
    </div>
}


export async function getServerSideProps() {
    return {
        props: {
            onSubmit: () => {console.log("not implemented");}
        }
    }
}

export default function ConceptInputsPreview(props: ConceptInputsProps){
    return <ConceptInputs {...props} />
}