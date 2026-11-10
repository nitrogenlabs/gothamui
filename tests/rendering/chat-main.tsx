import {ChatItem} from '@nlabs/gothamui/chat';
import {useState} from 'react';
import {createRoot} from 'react-dom/client';

const ChatExample = () => {
  const [selected, setSelected] = useState('');
  return <section aria-label="Published chat contract">
    <ChatItem avatar="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" id="contract"
      onClick={() => setSelected('chat-selected')} title="Retained chat" />
    <output aria-label="Submission">{selected}</output>
  </section>;
};
createRoot(document.getElementById('root')!).render(<ChatExample />);
