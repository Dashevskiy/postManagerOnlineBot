import React, { useState } from 'react';

const AdminPanel = () => {
  const [channels, setChannels] = useState([]);
  const [channelInput, setChannelInput] = useState('');

  const addChannel = () => {
    setChannels([...channels, channelInput]);
    setChannelInput('');
  };

  return (
    <div>
      <h1>Управление каналами</h1>
      <input
        type="text"
        placeholder="Введите канал (@username)"
        value={channelInput}
        onChange={(e) => setChannelInput(e.target.value)}
      />
      <button onClick={addChannel}>Добавить</button>

      <h2>Список каналов</h2>
      <ul>
        {channels.map((channel, index) => (
          <li key={index}>{channel}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
