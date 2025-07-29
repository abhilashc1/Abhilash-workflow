import React from 'react';

const NodesPanel = () => {
  // this function is called when you start dragging the message node
  const onDragStart = (event, nodeType) => {
    // we're setting data that the ReactFlow onDrop function will read
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="nodes-panel">
      {/* this is the draggable element */}
      <div
        className="node-item"
        onDragStart={(event) => onDragStart(event, 'textNode')}
        draggable // html attribute to make it draggable
      >
        <span>💬</span>
        Message
      </div>
      {/* 
        // TODO: add more node types here later
        // would be easy, just copy the div above and change the nodeType
      */}
    </aside>
  );
};

export default NodesPanel;