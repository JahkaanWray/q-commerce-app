import React from 'react';
import './Map.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


const containerStyle = {
    width: '50%',
    height: '100vh'
}
const center = {
    lat: 51.465,
    lng: -0.09

}

export default function MapContainer({orderData, time}){

    let markers = [];
    //console.log(orderData);

    if(orderData == null){
        console.log("Order Data not pulled through");
    }else{
        for(var i = 0; i < orderData.items.length; i++){
            var element = orderData.items[i];
            var coords = element.dispatch.dropOff.address.coordinates;
            var createdOn = element.createdOn;
            var completedOn = element.completedOn;
            //if (createdOn < 1625122800000 + time && completedOn > 1625122800000 + time){
                markers.push(<Marker
                    position={{lat: coords.lat,lng: coords.lon}}
                ></Marker>);
            //}

            /*markers.push(<Marker
                position={{lat: 51.468,lng: -0.09}}
            ></Marker>);*/
        }
    }
    
    
    /*orderData.items.forEach((element) => {
        orders.push(element.createdOn);
    });*/
    //console.log(orders);

    return (
        <LoadScript
          googleMapsApiKey="AIzaSyA-7_QvNPZabCKyLSi8ysXdQILdLJifT0g"
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
          >
            {markers}
          </GoogleMap>
        </LoadScript>
      )

}

function Map(){
    return (<GoogleMap
        zoom={10}
        center={{lat: 51.4, lng: 0}}
        mapContainerClassName="map-container"
    >

    </GoogleMap>
    );
}