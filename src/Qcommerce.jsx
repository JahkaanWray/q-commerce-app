import './Qcommerce.css';
import Map from './Map';
import ScheduleView from './ScheduleView';
import { useEffect, useState } from 'react';
import MapContainer from './Map';

console.log(process.env.REACT_APP_GORILLAS_API_KEY);

export default function Qcommerce(){

    const [time,setTime] = useState(0);
    const [playbackSpeed,setPlaybackSpeed] = useState(0);

    const [shifts, setShifts] = useState(defaultShifts);
    const [orderData, setOrderData] = useState(null);


    useEffect(() => {
        const loadData = async () => {
            const result = await loadOrders();
            console.log("Data fetch on mount: " + result);
            setOrderData(result);
        };
        //console.log(orderData);
        loadData();
    },[]);




    useEffect(() => {
        const interval = setInterval(() => {
            //console.log(time);
            //console.log(playbackSpeed);
            var s = playbackSpeed;
            console.log("Playback Speed: " + s*10);
            setTime((time) => {
                console.log(s);
                //console.log("Time: " + time);
                //console.log("Playback Speed: " + s);
                //console.log(time + 1);
                return time + s;
            });
            //console.log(time);
        },10);

        return () => {
            clearInterval(interval);
        }
    },[playbackSpeed]);
    //let orderData = loadOrders();
    //setOrderData(orders);

    function playPause(){
        if(playbackSpeed){
            setPlaybackSpeed(0);
        }else{
            setPlaybackSpeed(60000);
        }
    }

    console.log("Test");
    return(
        <>
            <p>{(time/(60*60000)).toFixed(3)}</p>
            <p>{playbackSpeed}</p>
            <button onClick={playPause}></button>
            <ScheduleView
                shifts={shifts}
                setShifts={setShifts}
            >  
            </ScheduleView>
            <MapContainer
                orderData={orderData}
                time={time}
                //setOrderData={setOrderData}
            >
            </MapContainer>
        </>
    )
}

async function loadOrders(){


    var myHeaders = new Headers();
    myHeaders.append("Authority", "prod-api.gorillas.io");
    myHeaders.append("Accept-Language", "en-Us,en;q=0.9");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", "https://portal.gorillas.io");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-site");
    myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320 Edg/104.0.5112.102");
    myHeaders.append("Authorization", "Bearer " + process.env.REACT_APP_GORILLAS_API_KEY);

    var raw = JSON.stringify({
        "pageNumber": 1,
        "recordsPerPage": 2000,
        "storeIds": [
            "604a2f5d17be050a2fbbf95a",
            "640b0eed922fff1dfb23cf86"
        ],
        "orderStatus": [
            "COMPLETE"
        ],
        "createdAfter": "2023-03-20T22:00:00.000Z",
        "createdBefore": "2023-03-20T23:59:59.000Z",
        "pickerUids": [
            "Ol67Nu-CStCW6f9zEMsjPw"
        ]
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    let response = await fetch("https://prod-api.gorillas.io/api/market/orders/list", requestOptions);
    let data = await response.json();
  
    data = JSON.stringify(data);
    data = JSON.parse(data);
    //console.log(data);
    return data;
}

function simulate(){

}


const defaultShifts = []



