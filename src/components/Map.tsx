import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker } from 'react-leaflet';

class LeafletMap  extends React.Component {
render() {
	const position: [number, number] = [ 59.334591, 18.063240 ];
    return (
      <Map center={position} zoom={14}>
        <TileLayer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
      </Map>
    );
  }
}

export default LeafletMap ;
