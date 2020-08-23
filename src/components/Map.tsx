import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker, Circle, CircleMarker, Polyline} from 'react-leaflet';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import axios from 'axios';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';



type Props = {
}

interface Node {
    long: number,
    lat: number,
	edges: string[],
	id: string
}

interface Edge {
    node1: {
		id: string,
		long : number,
		lat: number
	},
	node2: {
		id: string,
		long : number,
		lat: number
	},
	name: string,
	id: string,
	tier: number,
}

interface State {
  bus: boolean ,
  metro: boolean,
  toolMode: string,

  nodes: Node[],
  edges: Edge[],
  popUpPos: [number, number],
  popUpMsg: string
}

class LeafletMap  extends React.Component<Props, State> {
	constructor(props: Props) {
      super(props);

	  this.state = {
		  bus: false,
		  metro: false,
		  toolMode: "none",
		  nodes: [],
		  edges: [],
		  popUpPos: undefined,
		  popUpMsg: "",
		  popUpShow: false,

	  }
	  this.getInfo = this.getInfo.bind(this);
	  this.clickEdge = this.clickEdge.bind(this);
	  this.clickNode = this.clickNode.bind(this);

  	}


	componentDidMount() {
		this.getInfo()

		let DefaultIcon = L.icon({
		    iconUrl: icon,
		    shadowUrl: iconShadow
		});

		L.Marker.prototype.options.icon = DefaultIcon;
	}

	clickEdge(id : string, name : string, tier : number, bus: boolean, lat: number, long: number) {
		if(this.state.toolMode === "edge"){
			let msg = "ID: "+id+"<br />Namn: "+name+"<br />Tier: "+tier+"<br />Bus: "+bus
			console.log(msg)
			this.setState({
				popUpPos: [lat, long],
				popUpMsg: msg,
				popUpShow: true,
			});
		}

		else if(this.state.toolMode === "tier1" || this.state.toolMode === "tier2" || this.state.toolMode === "tier3" || this.state.toolMode === "tier4"){
			const tier = this.state.toolMode === "tier1"? 1: this.state.toolMode === "tier2"? 2: this.state.toolMode === "tier3"? 3: this.state.toolMode === "tier4"? 4:0
			axios.post('http://localhost:5000/edges/set_tier/'+id, tier)
						   .then(res => {
							 console.log(res)
							 this.state.edges.find(x => x.id === id).tier = res.data
						   })
						   .catch(err => console.log(err));
		}
		else if(this.state.toolMode === "bus"){
			axios.post('http://localhost:5000/edges/toggle_bus/'+id)
						   .then(res => {
							 console.log(res)
							 this.state.edges.find(x => x.id === id).bus = res.data
						   })
						   .catch(err => console.log(err));
		}
	}

	clickNode(id : string, long : number, lat : number) {
		if(this.state.toolMode === "node"){
			let msg = "ID: "+id+"<br /> Position: "+lat+", "+long
			console.log(msg)
			this.setState({
				popUpPos: [lat, long],
				popUpMsg: msg,
				popUpShow: true,
			});
		}
	}

	getInfo() {
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
			});
		});

		axios.get('http://localhost:5000/edges/')
		.then((res) =>{
			var edges = []
			for(var i = 0; i < res.data.length; i++){
				const edge = {
					node1 : {
						id: res.data[i].nodeOne.id,
						long: res.data[i].nodeOne.longitude,
						lat: res.data[i].nodeOne.latitude,
					},
					node2 : {
						id: res.data[i].nodeTwo.id,
						long: res.data[i].nodeTwo.longitude,
						lat: res.data[i].nodeTwo.latitude,
					},
					name : res.data[i].streetName,
					id: res.data[i]._id,
					tier: res.data[i].tier,
				}
				edges.push(edge)
			}
			this.setState({
				edges: edges
			});
		});
	}


render() {
	var radius = 2
	var weight = 2
	if(this.state.toolMode === "node"){
		radius = 10
		weight = 1
	}
	else if(this.state.toolMode === "edge" || this.state.toolMode === "tier1" || this.state.toolMode === "tier2" || this.state.toolMode === "tier3" || this.state.toolMode === "tier4" || this.state.toolMode === "bus"){
		radius = 8
		weight = 10
	}
	var circles = []
	var lines = []
	if(this.state.nodes[0]){
		for (var i = 0; i < this.state.nodes.length; i++){
			const lat = this.state.nodes[i].lat
			const long = this.state.nodes[i].long
			const id = this.state.nodes[i].id
			const circle = <CircleMarker onClick={() => this.clickNode(id, long, lat)} center={{lat:lat, lng:long}}  radius={radius}/>
			circles.push(circle)
		}
	}
	if(this.state.edges[0]){
		for (var i = 0; i < this.state.edges.length; i++){
			const p1 = this.state.edges[i].node1
			const p2 = this.state.edges[i].node2
			const id = this.state.edges[i].id
			const name = this.state.edges[i].name
			const tier = this.state.edges[i].tier
			const bus = this.state.edges[i].bus
			const line = <Polyline onClick={() => this.clickEdge(id,name,tier, bus, (p1.lat+p2.lat)/2, (p1.long+p2.long)/2)} positions={[[p1.lat, p1.long],[p2.lat, p2.long]]} weight={weight}/>
			lines.push(line)
		}
	}

	const position: [number, number] = [ 59.334591, 18.063240 ];
    return (
		<div>
		<ToggleButtonGroup type="checkbox" className="mb-2" style={{position: "absolute", top: "8px", left:"64px", zIndex:2}}>
		    <ToggleButton value={1} onChange={()=> {this.setState({bus: !this.state.bus})}}>Buss</ToggleButton>
		    <ToggleButton value={2} onChange={()=> {this.setState({metro: !this.state.metro})}}>Tbana</ToggleButton>
		  </ToggleButtonGroup>
		  <ToggleButtonGroup type="radio" name="tools" className="btn-group-vertical" onChange={()=> {this.setState({popUpShow: false})}} style={{position: "absolute", top: "80px", left:"8px", zIndex:2}}>
		  	<ToggleButton value={1} checked={this.state.toolMode === "none"}  onChange={()=> {this.setState({toolMode: "none"})}} style={{borderRadius : "5px", marginTop: "5px"}}>None</ToggleButton>
			<ToggleButton value={2} checked={this.state.toolMode === "edge"}  onChange={()=> {this.setState({toolMode: "edge"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Edge Info</ToggleButton>
			<ToggleButton value={3} checked={this.state.toolMode === "node"}  onChange={()=> {this.setState({toolMode: "node"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Node Info</ToggleButton>
			<ToggleButton value={4} checked={this.state.toolMode === "tier1"}  onChange={()=> {this.setState({toolMode: "tier1"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T1</ToggleButton>
			<ToggleButton value={5} checked={this.state.toolMode === "tier2"}  onChange={()=> {this.setState({toolMode: "tier2"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T2</ToggleButton>
			<ToggleButton value={6} checked={this.state.toolMode === "tier3"}  onChange={()=> {this.setState({toolMode: "tier3"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T3</ToggleButton>
			<ToggleButton value={7} checked={this.state.toolMode === "tier4"}  onChange={()=> {this.setState({toolMode: "tier4"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T4</ToggleButton>
			<ToggleButton value={8} checked={this.state.toolMode === "bus"}  onChange={()=> {this.setState({toolMode: "bus"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Toggle Bus</ToggleButton>
		  </ToggleButtonGroup>

      <Map center={position} zoom={14}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        />
		{circles}
		{lines}
		{this.state.popUpShow ? (
			<Popup closeButton={false} autoClose={false} closeOnClick={false} position={this.state.popUpPos}><div dangerouslySetInnerHTML={{ __html: this.state.popUpMsg }} /></Popup>
		) : (<></>)}
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
