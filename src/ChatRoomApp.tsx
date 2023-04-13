import React, {  memo, useState, useEffect, useRef } from 'react'
import './Chat.css'
import logo from './logo.png';
import config from './config'; // 导入配置文件

import { Markdown } from './components/markdown'; // 导入配置文件

interface WebSocketWithStatus extends WebSocket {
    status: "open" | "closed";
  }
  
  interface Message {
    id: string,
    userId: string,
    roomId: string,
    content: string,
    isSelf: boolean,
    action: string,
    avatarUrl: string,
    timestamp: string
  }
const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [roomId, setRoomId] = useState('1001')
    const chatBoxRef = useRef(null)

    const webSocketRef = useRef<WebSocketWithStatus | null>(null);

  const connectWebSocket = (url: string) => {
    if (webSocketRef.current && webSocketRef.current.status === "open") {
      return;
    }
    webSocketRef.current = new WebSocket(url) as WebSocketWithStatus;
    webSocketRef.current.status = "open";

    // WebSocket 监听事件
    webSocketRef.current.onopen = () => {
      console.log("WebSocket 连接成功");
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = Math.random().toString(36).substring(7);
        localStorage.setItem('userId', userId);
      }

      webSocketRef.current!.send(JSON.stringify({ action: 'join',userId: userId ,roomId: roomId }));

    };

    webSocketRef.current.onclose = () => {
      console.log("WebSocket 连接关闭");
      webSocketRef.current = null;
    };

    webSocketRef.current.onerror = (error) => {
      console.error("WebSocket 连接发生错误", error);
      if(webSocketRef.current){
        webSocketRef.current.close();
      }
    };
  };

    useEffect(() => {

        connectWebSocket(config.websocketUrl);
      }, []);
   

    useEffect(() => {
        if (webSocketRef.current) {
          webSocketRef.current.onmessage = event => {
            const message = JSON.parse(event.data)
            console.log(event.data)
            setMessages([...messages, message])
          };
        }
      }, [webSocketRef, messages]);
    

    const sendMessage = () => {
        if (inputText.trim() === '') {
            return
        }
        let userId = localStorage.getItem('userId');
        const messageObj = {
            id:  Math.random().toString(36),
            userId: userId!,
            roomId: roomId,
            content: inputText.trim(),
            isSelf: true,
            action: "send",
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            timestamp: new Date().getTime().toString()
        }

        webSocketRef.current!.send(JSON.stringify(messageObj))
        setMessages([...messages, messageObj])
        setInputText('')
    }


    const mockMessages = [
        { id: 1, isSelf: false, avatarUrl: 'https://i.pravatar.cc/150?img=1', content: 'Hello, how are you?' },
        { id: 2, isSelf: true, avatarUrl: 'https://i.pravatar.cc/150?img=2', content: 'I am fine. Thanks!' },
        { id: 3, isSelf: false, avatarUrl: 'https://i.pravatar.cc/150?img=1', content: 'That\'s great!' },
        { id: 3, isSelf: false, avatarUrl: 'https://i.pravatar.cc/150?img=1', content: 'That\'s great!' },

    ];

    return (
        <div className="container">
            <div className="wrapper">
                <div className="chatbox">
                    <div className="title">{roomId}</div>
                    <div className="content">
                        {messages.map(message => (
                            <div key={message.id} className={`message ${message.isSelf ? 'self' : ''}`}>
                                <div className="avatar">
                                    <img src={logo} alt="avatar" />
                                </div>
                                <div className="speech-bubble">
                                    <Markdown content={message.content} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="input-box">
                        <textarea  className="input" placeholder='Type your message here...'
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') sendMessage()
                            }} />
                        <button className="sendBtn" onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Chat