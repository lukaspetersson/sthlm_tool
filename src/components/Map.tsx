import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker, Circle, CircleMarker, Polyline} from 'react-leaflet';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import axios from 'axios';


type Props = {
}

interface Node {
    long: number,
    lat: number,
	edges: string[],
	id: string
}

interface Edge {
    node1: string,
    node2: string,
	name: string,
	id: string,
	used: boolean
}

interface State {
  bus: boolean ,
  metro: boolean,
  crossRoadMode: boolean,
  nodes: Node[],
  edges: Edge[],
  circles: any[],
  lines: any[]
}

class LeafletMap  extends React.Component<Props, State> {
	constructor(props: Props) {
      super(props);

	  this.state = {
		  bus: false,
		  metro: false,
		  crossRoadMode: false,
		  nodes: [],
		  edges: [],
		  circles: [],
		  lines: []
	  }
	  this.getNodes = this.getNodes.bind(this);
	  this.getEdges = this.getEdges.bind(this);
	  this.getComponents = this.getComponents.bind(this);
  	}


	componentDidMount() {
		this.getNodes()
	}

	getNodes() {
		axios.get('http://localhost:5000/nodes/')
		.then((res) =>{
			var nodes = []
			for(var i = 0; i < res.data.length; i++){
				const node = {
					long : res.data[i].longitude,
					lat : res.data[i].latitude,
					edges : res.data[i].edges,
					id: res.data[i]._id,
				}
				nodes.push(node)
			}
			this.setState({
				nodes: nodes
			}, () => {
			    this.getEdges();
			});
		});
	}

	getEdges() {
		axios.get('http://localhost:5000/edges/')
		.then((res) =>{
			var edges = []
			for(var i = 0; i < res.data.length; i++){
				const edge = {
					node1 : res.data[i].nodeOneID,
					node2 : res.data[i].nodeTwoID,
					name : res.data[i].streetName,
					id: res.data[i]._id,
					used: false
				}
				edges.push(edge)
			}
			this.setState({
				edges: edges
			}, () => {
			    this.getComponents();
			});
		});
	}

	getComponents(){
		if(this.state.nodes[0] && this.state.edges[0]){
			for (var i = 0; i < this.state.nodes.length; i++){
				const lat = this.state.nodes[i].lat
				const long = this.state.nodes[i].long
				const edges = this.state.nodes[i].edges
				const circle = <CircleMarker center={{lat:lat, lng: long}} radius={1}/>
				this.state.circles.push(circle)

				for (var j = 0; i < edges.length; j++) {

					var obj = this.state.edges.find(edgeObj => edgeObj.id === edges[j])
					if(obj){
						console.log(obj)
						if(!obj.used){
							obj.used = true
							const p1 = this.state.nodes.find(nodeObj => nodeObj.id === obj.node1)
							const p2 = this.state.nodes.find(nodeObj => nodeObj.id === obj.node2)
							if(p1 && p2){
								const line = <Polyline positions={[[p1.lat, p1.long],[p2.lat, p2.long]]}/>
								//this.state.lines.push(line)
							}
						}
					}
				}
			}
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
		{this.state.circles}
		{this.state.lines}
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
