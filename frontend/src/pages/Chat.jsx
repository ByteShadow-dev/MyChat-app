import React from 'react'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import Navbar from '../components/Navbar';

const Chat = () => {
  const { selectedUser } = useChatStore();

  return (
  <div className='flex flex-col h-screen'>
    <Navbar/>
    <div className='flex-1 bg-base-200 overflow-hidden'>
      <div className='flex items-center justify-center h-full px-4 py-4'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-full'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar/>
            {!selectedUser ? <NoChatSelected/> : <ChatContainer/>}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Chat