import React, { useEffect, useState } from 'react'
import MaterieleDataService from "../services/materiele.service";

function ListMateriele() {
    const [allMateriele, setAllMateriele] = useState([])

    const getAllMateriele = async () => {
        MaterieleDataService.getAll()
          .then(response => {
            setAllMateriele(response.data);
            
            console.log("Get all users successfully!");
          })
          .catch((e) => {
            console.log(e);
          });
    };

    useEffect(() =>{
        getAllMateriele();
    },[])

    return (
        <div>
            <ul>
                {allMateriele.map((localState, index) => (
                    <li key ={index}>{localState.name}</li>
                ))}
            </ul>
        </div>
    )
}

export default ListMateriele
