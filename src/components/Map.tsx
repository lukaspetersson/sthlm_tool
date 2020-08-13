import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker } from 'react-leaflet';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'

type Props = {
}

interface State {
  bus: boolean ,
  metro: boolean,
  crossRoadMode: boolean,
}

class LeafletMap  extends React.Component<Props, State> {
	constructor(props: Props) {
      super(props);

	  this.state = {
		  bus: false,
		  metro: false,
		  crossRoadMode: false,
	  }

  	}

render() {
	const position: [number, number] = [ 59.334591, 18.063240 ];
    return (
		<div>
		<ToggleButtonGroup type="checkbox" className="mb-2" style={{position: "absolute", top: "8px", left:"64px", zIndex:2}}>
		    <ToggleButton value={1} onChange={()=> {this.setState({bus: !this.state.bus})}}>Buss</ToggleButton>
		    <ToggleButton value={2} onChange={()=> {this.setState({metro: !this.state.metro})}}>Tbana</ToggleButton>
		  </ToggleButtonGroup>
		  <ToggleButtonGroup type="radio" name="tools" className="btn-group-vertical" style={{position: "absolute", top: "80px", left:"8px", zIndex:2}}>
  		    <ToggleButton value={1}  onChange={()=> {this.setState({crossRoadMode: !this.state.crossRoadMode})}} style={{borderRadius : "5px", marginTop: "5px"}}>Korsning</ToggleButton>
  		  </ToggleButtonGroup>

      <Map style={{cursor: this.state.crossRoadMode? "crosshair":"grab"}} center={position} zoom={14}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        />
		{this.state.bus ? (
			<TileLayer
	          url="http://openptmap.org/tiles/{z}/{x}/{y}.png"
	        />
		) : (<></>)}
		{this.state.metro ? (
			<TileLayer
	          url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
	        />
		) : (<></>)}
      </Map>
	  </div>
    );
  }
}



export default LeafletMap ;
