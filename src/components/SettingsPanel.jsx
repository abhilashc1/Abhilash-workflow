import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ node, updateNodeText, clearSelection }) => {
  // local state for the text input.
  const [text, setText] = useState(node.data.label);

  // This effect runs when the 'node' prop changes.
  // It's needed so if you select a *different* node, the textarea updates with the new node's text.
  // without this, it would keep showing the text of the first node you selected.
  useEffect(() => {
    setText(node.data.label);
  }, [node]);

  // handle typing in the textarea
  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText); // update our local state so the input feels responsive
    updateNodeText(node.id, newText); // and also call the function from App.jsx to update the actual node
  };

  return (
    <aside className="settings-panel">
      <div className="header">
        {/* the back arrow button */}
        <button onClick={clearSelection} className="back-button">
          ←
        </button>
        <span className="header-title">Message</span>
      </div>
      <div className="form">
        <label className="label" htmlFor="text-input">Text</label>
        <textarea
          id="text-input"
          className="input"
          value={text}
          onChange={handleChange}
          rows="4"
        />
      </div>
    </aside>
  );
};

export default SettingsPanel;