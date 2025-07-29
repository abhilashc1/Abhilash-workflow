import React from 'react';
import { Handle, Position } from 'reactflow';

// this is our custom node component
const TextNode = ({ data, selected }) => {
  return (
    // apply a 'selected' class if the node is selected, for styling
    <div className={`text-node ${selected ? 'selected' : ''}`}>
      
      {/* this is the little dot on the left where edges can connect TO */}
      <Handle type="target" position={Position.Left} />
      
      <div className="header">
        <span>Send Message</span>
        <span>💬</span>
      </div>
      <div className="content">
        {data.label}
      </div>

      {/* and this is the dot on the right where edges can connect FROM */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default TextNode;