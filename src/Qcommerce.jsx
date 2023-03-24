import React from 'react';
import './Qcommerce.css';
import Map from './Map';
import ScheduleView from './ScheduleView';
import { useEffect, useState } from 'react';
import MapContainer from './Map';
import haversine from 'haversine-distance';

export default function Qcommerce(){

    const [time,setTime] = useState(0);
    const [playbackSpeed,setPlaybackSpeed] = useState(0);

    const [shifts, setShifts] = useState(defaultShifts);
    const [orderData, setOrderData] = useState(null);


    useEffect(() => {
        const loadData = async () => {
            const result = await loadOrders();
            //console.log("Data fetch on mount: ");
            //console.log(result);
            setOrderData(result);
            //console.log(result.items);
            //console.log(result.items.length);
            console.log(simulate(result,[{
                startTime: 1679299200000,
                endTime: 1679356800000
            },
            {
                startTime: 1679299200000,
                endTime: 1679356800000
            },
            {
                startTime: 1679299200000,
                endTime: 1679356800000
            },
            {
                startTime: 1679299200000,
                endTime: 1679356800000
            },
            {
                startTime: 1679299200000,
                endTime: 1679356800000
            },
            {
                startTime: 1679299200000,
                endTime: 1679356800000
            }]));
        };
        ////console.log(orderData);
        loadData();
    },[]);




    useEffect(() => {
        const interval = setInterval(() => {
            ////console.log(time);
            ////console.log(playbackSpeed);
            var s = playbackSpeed;
            ////console.log("Playback Speed: " + s*10);
            setTime((time) => {
                ////console.log(s);
                ////console.log("Time: " + time);
                ////console.log("Playback Speed: " + s);
                ////console.log(time + 1);
                return time + s;
            });
            ////console.log(time);
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

    //console.log("Test");
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
    ////console.log(data);
    return data;
}

function simulate(initialOrderData,shifts){
    //console.log("Beginning simulation");

    if (shifts.length === 0){
        //console.log("Cannot simulate with no riders");
        return [];
    }
    let orderData = [];

    let ordersRemaining = initialOrderData.items.length;

    initialOrderData.items.forEach((item)=>{
        orderData.push({
            createdOn: item.createdOn,
            processingOn: null,
            confirmedOn: null,
            assignedOn: null,
            startedOn: null,
            completedOn: null,
            coordinates: {
                lat: item.dispatch.dropOff.address.coordinates.lat,
                lng: item.dispatch.dropOff.address.coordinates.lon
            },
            picker: null,
            rider: null
        })
    })
    

    //console.log(orderData.length);
    //console.log(orderData[157]);

    let i = 0;

    let currentSimState = {
        time: 0,
        numOrders: 0,

        newOrders: [],
        processingOrders: [],
        readyOrders: [],
        assignedOrders: [],
        dispatchedOrders: [],

        nextPickerReady: [],
        nextRiderBack: [],
        ordersCompletedOn: [],

        readyRiders: [],
        readyPickers: 2,

        shiftsStatus: []
    }

    shifts.forEach((shift)=>{
        currentSimState.shiftsStatus.push('Before');
    })

    let time = 0;
    let newOrders = [];
    let processingOrders = [];
    let readyOrders = [];
    let assignedOrders = [];
    let dispatchedOrders = [];

    let nextPickerReady = [];
    let nextRiderBack = [];
    let ordersCompletedOn = [];

    let readyRiders = [];
    let readyPickers = 2;

    const speed = 10*1000/(60*60*1000);

    //console.log(currentSimState);

    while (ordersRemaining > 0){
        //let nextEventTime = Infinity;


        //Find next event based on current state
        const event = findNextEvent();
        console.log(event);
        //Update state based on event
        applyEvent(event);
        //console.log(currentSimState);
        printSimState();
    }

    function findNextEvent(){
        let nextEvent = {
            time: Infinity,
    
            type: '',
            order: null,
            rider: null, 
            picker: null
        }

        //Check for new order
        //console.log(orderData.length - 1 - currentSimState.numOrders);
        //console.log(ordersRemaining);
        if (currentSimState.numOrders < orderData.length){
            const orderTime = orderData[orderData.length - 1 - currentSimState.numOrders].createdOn;
            if (orderTime > currentSimState.time && orderTime < nextEvent.time){
                nextEvent = {
                    time: orderTime,

                    type: 'New Order',
                    order: currentSimState.numOrders,
                    rider: null,
                    picker: null
                }
            }
        }
        //Check for order confirmed
        for (let i = 0; i < currentSimState.nextPickerReady.length; i++){
            if (currentSimState.nextPickerReady[i].time < nextEvent.time){
                nextEvent = {
                    time: currentSimState.nextPickerReady[i].time,

                    type: 'Order Confirmed',
                    order: currentSimState.nextPickerReady[i].order,
                    rider: null,
                    picker: currentSimState.nextPickerReady[i].picker
                }
            }
        }
        //Check for rider returning
        for (let i = 0; i < currentSimState.nextRiderBack.length; i++){
            if (currentSimState.nextRiderBack[i].time < nextEvent.time){
                nextEvent = {
                    time: currentSimState.nextRiderBack[i].time,

                    type: 'Rider Returned',
                    order: null,
                    rider: currentSimState.nextRiderBack[i].rider,
                    picker: null
                }
            }
        }
    
        //Check for rider shift started
        for (let i = 0; i < currentSimState.shiftsStatus.length; i++){
            if (currentSimState.shiftsStatus[i] === 'Before' && shifts[i].startTime <= nextEvent.time){
                nextEvent = {
                    time: shifts[i].startTime,

                    type: 'Rider Shift Started',
                    order: null,
                    rider: i,
                    picker: null
                }
            }
        }

        //console.log(nextEvent);

        return nextEvent
    }

    function applyEvent(nextEvent){
        if (nextEvent.type === 'New Order'){
            ////console.log(`New Order Created At t=${nextEvent.time}`)
            if (currentSimState.readyPickers > 0){
                ////console.log(`New Order + ${currentSimState.readyPickers} pickers ready => Pick Order`);
                currentSimState.readyPickers -= 1;
                orderData[orderData.length - 1 - nextEvent.order].processingOn = nextEvent.time;
                orderData[orderData.length - 1 - nextEvent.order].confirmedOn = nextEvent.time + 2*60*1000;

                currentSimState.processingOrders.push(nextEvent.order);
                currentSimState.nextPickerReady.push({
                    time: nextEvent.time + 2*60*1000,
                    picker: null,
                    order: nextEvent.order
                })

                ////console.log(`nextPickerReady Object: `);
                ////console.log(currentSimState.nextPickerReady);
            }else{
                ////console.log(`New Order + 0 pickers read => order sitting`);
                currentSimState.newOrders.push(nextEvent.order);
            }
            currentSimState.numOrders += 1;


        }else if (nextEvent.type === 'Order Confirmed'){
            console.log(`Order ${nextEvent.order} confirmed at t = ${nextEvent.time}`);
            for (let i = 0; i < currentSimState.processingOrders.length; i++){
                if (currentSimState.processingOrders[i] === nextEvent.order){
                    currentSimState.processingOrders.splice(i,1);
                    break;
                }
            }
            for (let i = 0; i < currentSimState.nextPickerReady.length; i++){
                if (currentSimState.nextPickerReady[i].order === nextEvent.order){
                    currentSimState.nextPickerReady.splice(i,1);
                    break;
                }
            }

            if (currentSimState.readyRiders.length > 0){

                ////console.log(`Order confirmed + ${currentSimState.readyRiders.length} riders ready => assign and deliver order`);
                let rider = currentSimState.readyRiders[0];
                currentSimState.readyRiders.splice(0,1);


                const travelTime = calculateTravelTime(speed);

                orderData[orderData.length - 1 - nextEvent.order].confirmedOn = nextEvent.time;
                orderData[orderData.length - 1 - nextEvent.order].assignedOn = nextEvent.time;
                orderData[orderData.length - 1 - nextEvent.order].startedOn = nextEvent.time;
                orderData[orderData.length - 1 - nextEvent.order].completedOn = nextEvent.time + travelTime;

                console.log(`Order ${nextEvent.order} assigned to rider ${rider} at t = ${nextEvent.time}`);
                console.log(`Order ${nextEvent.order} completed by rider ${rider} at t = ${nextEvent.time + travelTime}`)

                orderData[orderData.length - 1 - nextEvent.order].rider = rider;

                ordersRemaining--;

                console.log(`Orders Remaining: ${ordersRemaining}`);
                console.log(`Num Orders: ${currentSimState.numOrders}`);

                //currentSimState.dispatchedOrders.push(nextEvent.order);

                currentSimState.nextRiderBack.push({
                    time: nextEvent.time + 2*travelTime,

                    rider: rider,
                })

                for(let i = 0; i < currentSimState.nextPickerReady.length; i++){
                    if (currentSimState.nextPickerReady[i].order === nextEvent.order){
                        currentSimState.nextPickerReady.splice(i,1);
                    }
                }

            }else{
                ////console.log(`Order confirmed + no riders ready => Order ready`);
                currentSimState.readyOrders.push(nextEvent.order);
            }

            if (currentSimState.newOrders.length > 0){
                orderData[orderData.length - 1 - currentSimState.newOrders[0]].processingOn = nextEvent.time;
                orderData[orderData.length - 1 - currentSimState.newOrders[0]].confirmedOn = nextEvent.time + 2*60*1000;
                
                currentSimState.processingOrders.push(currentSimState.newOrders[0]);
                currentSimState.nextPickerReady.push({
                    time: nextEvent.time + 2*60*1000,

                    picker: null,
                    order: currentSimState.newOrders[0]

                })
                currentSimState.newOrders.splice(0,1);
            }else{
                currentSimState.readyPickers++;
            }
        }else if (nextEvent.type === 'Rider Returned'){

            //console.log(currentSimState.nextRiderBack);

            for(let i = 0; i < currentSimState.nextRiderBack.length; i++){
                if (currentSimState.nextRiderBack[i].rider === nextEvent.rider && currentSimState.nextRiderBack[i].time === nextEvent.time){
                    currentSimState.nextRiderBack.splice(i,1);
                    break;
                } 
            }
            //console.log(currentSimState.nextRiderBack);
            if (nextEvent.time > shifts[nextEvent.rider].endTime){
                //console.log(`Rider returned + rider shift finished => end shift`);
                currentSimState.shiftsStatus[nextEvent.rider] = 'After';
            }else{

                if (currentSimState.readyOrders.length > 0){

                    //console.log(`Rider returned + orders ready => assign and deliver order`);
                    //console.log(currentSimState.nextRiderBack.length);
                    const travelTime = calculateTravelTime(speed);

                    orderData[orderData.length - 1 - currentSimState.readyOrders[0]].assignedOn = nextEvent.time;
                    orderData[orderData.length - 1 - currentSimState.readyOrders[0]].startedOn = nextEvent.time;
                    orderData[orderData.length - 1 - currentSimState.readyOrders[0]].completedOn = nextEvent.time + travelTime;

                    orderData[orderData.length - 1 - currentSimState.readyOrders[0]].rider = nextEvent.rider;

                    currentSimState.nextRiderBack.push({
                        time: nextEvent.time + 2*travelTime,

                        rider: nextEvent.rider

                    })

                    //console.log(currentSimState.nextRiderBack.length);

                    currentSimState.readyOrders.splice(0,1);

                    ordersRemaining--;

                    console.log(`Orders Remaining: ${ordersRemaining}`);
                    console.log(`Num Orders: ${currentSimState.numOrders}`);

                }else{
                    //console.log(`Rider returned + no orders ready => Rider ready`);
                    currentSimState.readyRiders.push(nextEvent.rider);
                }
            }
        }else if (nextEvent.type === 'Rider Shift Started'){
            //console.log('Rider Shift Started');
            currentSimState.readyRiders.push(nextEvent.rider);
            currentSimState.shiftsStatus[nextEvent.rider] = 'During';
        }

        ////console.log(currentSimState);
    }

    function printSimState(){
        console.log('New Orders:');
        console.log(currentSimState.newOrders);
        console.log('Processing Orders:');
        console.log(currentSimState.processingOrders);
        console.log(currentSimState.processingOrders.length);
        console.log('Ready Orders:');
        console.log(currentSimState.readyOrders);
        console.log('Assigned Orders:');
        console.log(currentSimState.assignedOrders);
        console.log('Dispatched Orders:');
        console.log(currentSimState.dispatchedOrders);
        console.log('\nPicker Ready:    ');
        console.log(currentSimState.readyPickers);
        console.log('Riders Ready: ');
        console.log(currentSimState.readyRiders);
        console.log('\nNext Rider Back:');
        console.log(currentSimState.nextRiderBack);
        console.log(currentSimState.nextRiderBack.length);
        console.log('Next Picker Ready: ');
        console.log(currentSimState.nextPickerReady);
        console.log(currentSimState.nextPickerReady.length);
        console.log();
    }


    orderData.reverse();
    return orderData;
}
function calculateTravelTime(/*startPos, endPos, */speed){
    
    
    //const dist = haversine(startPos, endPos);
    //const travelTime = dist/speed;

    return 8*60*1000;
    //return dist/speed;
}


const defaultShifts = []



