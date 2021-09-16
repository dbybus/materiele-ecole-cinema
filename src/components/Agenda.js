import React, { useEffect, useState } from "react";
import { ReactAgenda , ReactAgendaCtrl , guid ,  Modal } from 'react-agenda';
import {Container} from 'react-bootstrap'

function Agenda() {

    var colors= {
        'color-1':"rgba(102, 195, 131 , 1)" ,
        "color-2":"rgba(242, 177, 52, 1)" ,
        "color-3":"rgba(235, 85, 59, 1)"
    }
       
    var now = new Date();
       
    var items = [
        {
            _id            :guid(),
            name          : 'Meeting , dev staff!',
            startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
            endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
            classes       : 'color-1'
        },
        {
            _id            :guid(),
            name          : 'Working lunch , Holly',
            startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 11, 0),
            endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 13, 0),
            classes       : 'color-2 color-3'
        },
    ]
    const [itemC, setItems] = useState(items);
    const [selected, setSelected] = useState("");
    const [cellHeight, setCellHeight] = useState(30);
    const [showModal, setShowModal] = useState(false);
    const [locale, setLocale] = useState("fr");
    const [rowsPerHour, setRowsPerHour] = useState(2);
    const [numberOfDays, setNumberOfDays] = useState(4);
    const [startDate, setStartDate] = useState(new Date());
    
    const handleCellSelection = (item) =>{
        console.log('handleCellSelection',item)
    }

    const handleItemEdit = (item) => {
        console.log('handleItemEdit', item)
    }

    const handleRangeSelection = (item) => {
        console.log('handleRangeSelection', item)
    }

    return (
        <div>
            <Container>
                <ReactAgenda
                    minDate={now}
                    maxDate={new Date(now.getFullYear(), now.getMonth()+3)}
                    disablePrevButton={false}
                    startDate={startDate}
                    cellHeight={cellHeight}
                    locale={locale}
                    items={itemC}
                    numberOfDays={numberOfDays}
                    rowsPerHour={rowsPerHour}
                    itemColors={colors}
                    autoScale={false}
                    fixedHeader={true}
                    onItemEdit={handleCellSelection(itemC)}
                    onCellSelect={handleItemEdit(itemC)}
                    onRangeSelection={handleRangeSelection(itemC)}/>
            </Container>
        </div>
    )
}

export default Agenda
