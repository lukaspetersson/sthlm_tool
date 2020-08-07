import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker } from 'react-leaflet';

class LeafletMap  extends React.Component {
render() {
	const position: [number, number] = [ 59.334591, 18.063240 ];
    return (
      <Map center={position} zoom={14}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        />
		<TileLayer
          url="http://openptmap.org/tiles/{z}/{x}/{y}.png"
        />
		<TileLayer
          url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
        />
      </Map>
    );
  }
}

export default LeafletMap ;
