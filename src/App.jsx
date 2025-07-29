import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType, 
} from 'reactflow';
import 'reactflow/dist/style.css'; // dont forget the styles

import NodesPanel from './components/NodesPanel';
import SettingsPanel from './components/SettingsPanel';
import TextNode from './components/TextNode';

import './App.css';

// Here we're telling react-flow "hey, when you see a node with type 'textNode', use our TextNode component"
const nodeTypes = {
  textNode: TextNode,
};

// simple way to get unique ids
let id = 0;
const getId = () => `node_${id++}`;

const App = () => {
  const reactFlowWrapper = useRef(null);
  // states for nodes, edges, etc.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null); // which node is currently selected
  const [notification, setNotification] = useState({ message: '', type: '' }); // for the save notifcation
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  /*
   * this is for when you drag a line between two nodes
   * we also add the arrowhead here
   */
  const onConnect = useCallback(
    (params) => {
      // RULE: a source handle can only have one outgoing edge.
      const sourceHasEdge = edges.some((edge) => edge.source === params.source);
      if (sourceHasEdge) {
        console.warn("A source handle can only have one outgoing edge.");
        return; // stop the connection from being made
      }
      
      const edgeWithArrow = { 
        ...params, 
        markerEnd: { 
          type: MarkerType.ArrowClosed, // make it a nice solid arrow
        } 
      };

      setEdges((eds) => addEdge(edgeWithArrow, eds));
    },
    [edges, setEdges] // gotta have edges in the dependency array
  );

  // needed for the drop to work
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // this runs when you drop a new node from the panel onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid, might not be
      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      // we need to translate screen coords to flow coords
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `test message ${id}` }, // default text
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // when you click a node, we set it as selected
  // this is how the SettingsPanel knows what to show
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    // also need to visually mark it as selected for react flow
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  }, [setNodes]);

  // this gets called from the SettingsPanel to update the text
  const updateNodeText = (nodeId, text) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // important to spread the existing data to not lose other properties
          node.data = { ...node.data, label: text };
        }
        return node;
      })
    );
    // if the currently selected node is the one we are editing, we should update it too
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: text } });
    }
  };

  // this is for the back button in the settings panel
  const clearSelection = () => {
    setSelectedNode(null);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false }))); // unselect all nodes
  };

  // The main save logic.
  const saveFlow = () => {
    // get a list of all node ids that are a target of an edge
    const targetNodeIds = new Set(edges.map((edge) => edge.target));
    
    // Find nodes that are NOT in the target list. These have empty target handles.
    const nodesWithEmptyTargets = nodes.filter(node => !targetNodeIds.has(node.id));

    // RULE: if there are more than 1 nodes total, only 1 can have an empty target handle
    if (nodes.length > 1 && nodesWithEmptyTargets.length > 1) {
      setNotification({ message: 'Cannot save Flow', type: 'error' });
    } else {
      setNotification({ message: 'Flow Saved!', type: 'success' });
      // in a real app, you'd probably send this to a server
      console.log('Flow saved:', { nodes, edges }); 
    }

    // make the message disappear after a few seconds
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  return (
    <div className="container">
      <ReactFlowProvider>
        <div className="flow-builder" ref={reactFlowWrapper}>
          <div className="top-bar">
            {/* only show the notifcation when there's a message */}
            {notification.message && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
              </div>
            )}
            <button className="save-button" onClick={saveFlow}>
              Save Changes
            </button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <div className="panel">
        {/* this is a conditional render. Show settings panel if a node is selected, otherwise show the nodes list */}
        {selectedNode ? (
          <SettingsPanel
            node={selectedNode}
            updateNodeText={updateNodeText}
            clearSelection={clearSelection}
          />
        ) : (
          <NodesPanel />
        )}
      </div>
    </div>
  );
};

export default App;