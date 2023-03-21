import { useState } from 'react';
import './ScheduleView.css';

function ScheduleToolbar({shifts, setShifts}){

    const [newShiftData, setNewShiftData] = useState({startTime:0,endTime:0.5});

    function addShifts(){
        var a = newShiftData.startTime;
        var b = newShiftData.endTime;
        if (b > a && b <= 1 && b >= 0 && a <= 1 && a >= 0){
            const next = shifts.concat([{start: a,end: b}]);
            setShifts(next);
        }
    }
    function clearShifts(){
        setShifts([]);
    }
    return(
        <div className="ScheduleToolbar">
            <input type="text" 
                value = {newShiftData.startTime}
                onChange={(e) => {setNewShiftData({startTime:e.target.value,endTime:newShiftData.endTime})}}/>
            <input type="text" 
                value = {newShiftData.endTime}
                onChange={(e) => {setNewShiftData({startTime:newShiftData.startTime,endTime:e.target.value})}}/>
            <button onClick={addShifts}
            name='addShift'>Add Shift</button>
            <button onClick={clearShifts}> Clear Shifts</button>
        </div>
    )
}

function Shift({start,end}){
    const shiftStyle = {

        left: `${start*100}%`,
        width: `${(end-start)*100}%`

    }
    console.log(start);
    console.log(end);
    return(
        <div className='Shift' style={shiftStyle}></div>
    )
}

function ScheduleRow({shift}){
    console.log(shift);
    return(
        <div className="ScheduleRow">
            <Shift
                start={shift.start}
                end={shift.end}/>
            
        </div>
    )
}

export default function ScheduleView({shifts, setShifts}){

    const rows = [];

    //const [shifts, setShifts] = useState([]);

    shifts.forEach((shift) => {
        rows.push(
            <ScheduleRow shift={shift}></ScheduleRow>
        )
        console.log(shift.start);
    })
    return(
        <div className="ScheduleView">
            <ScheduleToolbar 
                shifts = {shifts}
                setShifts = {setShifts}
            ></ScheduleToolbar>
            {rows}
        
        </div>
    )
}

var defaultShifts = []
for (var i = 0; i < 51; i++){
    defaultShifts.push({start:0.01*i,end: 0.5 + 0.01*i});
}
//console.log(shifts);