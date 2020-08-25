import React from 'react';
import 'leaflet/dist/leaflet.css';
import {Map, TileLayer, Popup, Marker, Circle, CircleMarker, Polyline} from 'react-leaflet';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import axios from 'axios';
import NameInput from "./NameInput";



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
	bus: boolean
}

interface State {
  bus: boolean ,
  metro: boolean,
  toolMode: string,
  nodes: Node[],
  edges: Edge[],
  popUp:{
	  pos: [number, number],
	  msg: string,
	  show: boolean
  },
  addEdge: {
	  node1: Node,
	  node2: Node,
	  name: string,
	  showModal: boolean
  },
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
		  popUp:{
			  pos: [0,0],
			  msg: "",
			  show: false
		  },
		  addEdge: {
			  node1: {} as Node,
			  node2: {} as Node,
			  name: "",
			  showModal: false,
		  },
	  }
	  this.getInfo = this.getInfo.bind(this);
	  this.clickEdge = this.clickEdge.bind(this);
	  this.clickNode = this.clickNode.bind(this);
	  this.clickMap = this.clickMap.bind(this);
	  this.addEdge = this.addEdge.bind(this);
	  this.changeEdgeName = this.changeEdgeName.bind(this);


  	}


	componentDidMount() {
		this.getInfo()

		let DefaultIcon = L.icon({
		    iconUrl: icon,
		    shadowUrl: iconShadow
		});

		L.Marker.prototype.options.icon = DefaultIcon;
	}

	changeEdgeName(event : string[]) {
	this.setState({
		addEdge: {
		 node1: this.state.addEdge.node1,
		 node2: this.state.addEdge.node2,
		 name: event[0],
		 showModal: true
	 }
	});
  }

	addEdge(){

		//TODO: add edge to node
		const nodeOneID = this.state.addEdge.node1.id
		const nodeOneCoords = [this.state.addEdge.node1.long, this.state.addEdge.node1.lat]
		const nodeTwoID = this.state.addEdge.node2.id
		const nodeTwoCoords = [this.state.addEdge.node2.long, this.state.addEdge.node2.lat]
		const name = this.state.addEdge.name

		const obj = {"nodeOne" : {"id" : nodeOneID, "pos": nodeOneCoords}, "nodeTwo" : {"id" : nodeTwoID, "pos": nodeTwoCoords}, "streetName" : name}
		axios.post('http://localhost:5000/edges/add/', obj)
					   .then(res => {
							const edge = {
								node1 : {
									id: nodeOneID,
									long: nodeOneCoords[0],
									lat: nodeOneCoords[1],
								},
								node2 : {
									id: nodeTwoID,
									long: nodeTwoCoords[0],
									lat: nodeTwoCoords[1],
								},
								name : name,
								id: res.data,
								tier: 0,
								bus: false,
							}
							console.log("Edge added: ",edge)
						 this.setState(prevState => ({
							  edges: [...prevState.edges, edge],
							  addEdge: {
								   node1: {} as Node,
								   node2: {} as Node,
								   name: "",
								   showModal: false
							   },
							}))
					})
					   .catch(err => console.log(err));

	}

	clickMap(event : any){
		if(this.state.toolMode === "addNode"){
			const obj = {"pos" : [event.latlng.lng, event.latlng.lat]}
			axios.post('http://localhost:5000/nodes/add/', obj)
						   .then(res => {
							   const node = {
								   long : event.latlng.lng,
								   lat : event.latlng.lat,
								   edges : [],
								   id: res.data,
							   }
								console.log("Node added: ",node)
							 this.setState(prevState => ({
								  nodes: [...prevState.nodes, node]
								}))
						})
						   .catch(err => console.log(err));
		}
	}

	clickEdge(id : string, name : string, tier : number, bus: boolean, lat: number, long: number) {
		if(this.state.toolMode === "edge"){
			let msg = "ID: "+id+"<br />Namn: "+name+"<br />Tier: "+tier+"<br />Bus: "+bus
			console.log(msg)
			this.setState({
				popUp:{
	  			  pos: [lat, long],
	  			  msg: msg,
	  			  show: true
	  		  }
			});
		}

		else if(this.state.toolMode === "tier1" || this.state.toolMode === "tier2" || this.state.toolMode === "tier3" || this.state.toolMode === "tier4"){
			const tier = this.state.toolMode === "tier1"? 1: this.state.toolMode === "tier2"? 2: this.state.toolMode === "tier3"? 3: this.state.toolMode === "tier4"? 4:0
			axios.post('http://localhost:5000/edges/set_tier/'+id, tier)
						   .then(res => {
							 console.log("Tire set",res)

							 for(const edge of this.state.edges){
								 if(edge.id === id){
									 edge.tier = res.data
								 }
							 }

						   })
						   .catch(err => console.log(err));
		}
		else if(this.state.toolMode === "bus"){
			axios.post('http://localhost:5000/edges/toggle_bus/'+id)
						   .then(res => {
							 console.log("Bus toggle",res)

							 for(const edge of this.state.edges){
								 if(edge.id === id){
									 edge.bus = res.data
								 }
							 }

						   })
						   .catch(err => console.log(err));
		}
		else if(this.state.toolMode === "removeEdge"){
			axios.delete('http://localhost:5000/edges/delete/'+id)
						   .then(res => {
							 console.log("Edge deleted",res)
							 for (var i = 0; i < this.state.edges.length; i++){
								 var edge = this.state.edges[i]
								 if(edge.id === id){
									 let array = [...this.state.edges]
									 array.splice(i, 1)
									 this.setState({edges: array})
								 }
							 }

							 const nodeIDs : [string, string] = [res.data.nodeOne.id,res.data.nodeTwo.id]
							 const obj = {"edge" : id}
							 for (const nodeID of nodeIDs){
								 axios.post('http://localhost:5000/nodes/delete_edge/'+nodeID, obj)
	 				 						   .then(res => {
												   for (var i = 0; i < this.state.nodes.length; i++){
					  								 var node = this.state.nodes[i]
					  								 if(node.id === nodeID){
														 let array : string[] = []
														 for(var j=0; j<node.edges.length;j++){
															 const edgeId = node.edges[j]
															 if(edgeId === id){
																 array = node.edges
	 															 array.splice(j, 1)
															 }
														 }
														 node.edges = array
														 let array2 = this.state.nodes
														 array2.splice(i,1)
														 array2.push(node)
														 this.setState({nodes: array2})
					  								 }
					  							 }
	 				 						})
	 				 						   .catch(err => console.log(err));
	 								   }
	 						   })
	 						   .catch(err => console.log(err));
			 }
	}

	clickNode(id : string, long : number, lat : number) {
		if(this.state.toolMode === "node"){
			let msg = "ID: "+id+"<br /> Position: "+lat+", "+long
			console.log(msg)
			this.setState({
				popUp:{
	  			  pos: [lat, long],
	  			  msg: msg,
	  			  show: true
	  		  }
			});
		}
		if(this.state.toolMode === "addEdge"){
			const node = {
				long : long,
				lat : lat,
				edges : [],
				id: id,
			}
			if(Object.keys(this.state.addEdge.node1).length !== 0 && id !== this.state.addEdge.node1.id){
				this.setState({
					addEdge: {
					 node1: this.state.addEdge.node1,
					 node2: node,
					 name: this.state.addEdge.name,
					 showModal: true
				 }
				});
			}else{
				this.setState({
					addEdge: {
					 node1: node,
					 node2: {} as Node,
					 name: this.state.addEdge.name,
					 showModal: false
				 }
				});
			}
		}
		if(this.state.toolMode === "removeNode"){
			// TODO: remove connecting edges
			axios.delete('http://localhost:5000/nodes/delete/'+id)
						   .then(res => {
							 console.log("Node deleted",res)
							 for (var i = 0; i < this.state.nodes.length; i++){
								 var node = this.state.nodes[i]
								 if(node.id === id){
									 var array = [...this.state.nodes]
									 array.splice(i, 1)
									 this.setState({nodes: array})
								 }
							 }
						   })
						   .catch(err => console.log(err));
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
			var edges:Edge[] = []
			var names:string[] = []
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
					bus: res.data[i].bus
				}
				edges.push(edge)
				if (!names.includes(res.data[i].streetName)) {
					names.push(res.data[i].streetName)
				}
			}
			this.setState({
				edges: edges,
			});
		});
	}


render() {

	var radius = 2
	var weight = 2
	if(this.state.toolMode === "node" || this.state.toolMode === "addEdge"|| this.state.toolMode === "removeNode"){
		radius = 10
		weight = 1
	}
	else if(this.state.toolMode === "edge" || this.state.toolMode === "tier1" || this.state.toolMode === "tier2" || this.state.toolMode === "tier3" || this.state.toolMode === "tier4" || this.state.toolMode === "bus"|| this.state.toolMode === "removeEdge"){
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
		  <ToggleButtonGroup type="radio" name="tools" className="btn-group-vertical" onChange={()=> {this.setState({popUp:{pos: this.state.popUp.pos,msg: this.state.popUp.msg,show: false}})}} style={{position: "absolute", top: "80px", left:"8px", zIndex:2}}>
		  	<ToggleButton value={1} checked={this.state.toolMode === "none"}  onChange={()=> {this.setState({toolMode: "none"})}} style={{borderRadius : "5px", marginTop: "5px"}}>None</ToggleButton>
			<ToggleButton value={2} checked={this.state.toolMode === "edge"}  onChange={()=> {this.setState({toolMode: "edge"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Edge Info</ToggleButton>
			<ToggleButton value={3} checked={this.state.toolMode === "node"}  onChange={()=> {this.setState({toolMode: "node"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Node Info</ToggleButton>
			<ToggleButton value={4} checked={this.state.toolMode === "tier1"}  onChange={()=> {this.setState({toolMode: "tier1"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T1</ToggleButton>
			<ToggleButton value={5} checked={this.state.toolMode === "tier2"}  onChange={()=> {this.setState({toolMode: "tier2"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T2</ToggleButton>
			<ToggleButton value={6} checked={this.state.toolMode === "tier3"}  onChange={()=> {this.setState({toolMode: "tier3"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T3</ToggleButton>
			<ToggleButton value={7} checked={this.state.toolMode === "tier4"}  onChange={()=> {this.setState({toolMode: "tier4"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Set T4</ToggleButton>
			<ToggleButton value={8} checked={this.state.toolMode === "bus"}  onChange={()=> {this.setState({toolMode: "bus"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Toggle Bus</ToggleButton>
			<ToggleButton value={9} checked={this.state.toolMode === "addEdge"}  onChange={()=> {this.setState({toolMode: "addEdge"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Add Edge</ToggleButton>
			<ToggleButton value={10} checked={this.state.toolMode === "removeEdge"}  onChange={()=> {this.setState({toolMode: "removeEdge"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Remove Edge</ToggleButton>
			<ToggleButton value={11} checked={this.state.toolMode === "addNode"}  onChange={()=> {this.setState({toolMode: "addNode"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Add Node</ToggleButton>
			<ToggleButton value={12} checked={this.state.toolMode === "removeNode"}  onChange={()=> {this.setState({toolMode: "removeNode"})}} style={{borderRadius : "5px", marginTop: "5px"}}>Remove Node</ToggleButton>

		  </ToggleButtonGroup>

		  <Modal
	        show={this.state.addEdge.showModal}
	        onHide={()=> { this.setState(prevState => ({addEdge: {node1: {} as Node, node2: {} as Node, name: "", showModal: false}}))}}
	 			>
	        <Modal.Header closeButton>
	          <Modal.Title>Set streetname</Modal.Title>
	        </Modal.Header>
	        <Modal.Body>
				<Form>
				   <Form.Group controlId="setName">
					 <Form.Label>
					   Enter name of the street
					 </Form.Label>
						<NameInput nameFunction={this.changeEdgeName}/>
				   </Form.Group>
				 </Form>
	        </Modal.Body>
	        <Modal.Footer>
	          <Button variant="primary" onClick={this.addEdge} >Set</Button>
	        </Modal.Footer>
	      </Modal>

      <Map center={position} zoom={14} onClick={this.clickMap} style={{cursor: this.state.toolMode === "addNode"? "pointer" : "grab"}}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        />
		{circles}
		{lines}
		{this.state.popUp.show ? (
			<Popup closeButton={false} autoClose={false} closeOnClick={false} position={this.state.popUp.pos}><div dangerouslySetInnerHTML={{ __html: this.state.popUp.msg }} /></Popup>
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
