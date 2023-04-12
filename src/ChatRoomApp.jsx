import React, { useState, useEffect, useRef } from 'react'
import './Chat.css'
import logo from './logo.png';
import config from './config'; // 导入配置文件


const Chat = () => {
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [roomId, setRoomId] = useState('1001')
    const chatBoxRef = useRef(null)

    const webSocketRef = useRef(null);

    useEffect(() => {

        let userId = localStorage.getItem('userId');
        if (!userId) {
          userId = Math.random().toString(36).substring(7);
          localStorage.setItem('userId', userId);
        }

        // webSocketRef.current = new WebSocket('ws://localhost:8080/chat');
        webSocketRef.current = new WebSocket(config.websocketUrl);
        
        webSocketRef.current.onopen = () => {
          webSocketRef.current.send(JSON.stringify({ action: 'join',userId: userId ,roomId: roomId }));
        };

        return () => {
            webSocketRef.current.close()
        }
    }, [])

    useEffect(() => {
        if (webSocketRef.current) {
          webSocketRef.current.onmessage = event => {
            const message = JSON.parse(event.data)
            console.log(event.data)
            setMessages([...messages, message])
          };
        }
      }, [webSocketRef, messages]);
    
      useEffect(() => {
        if (webSocketRef.current) {
          webSocketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
          };
        }
      }, [webSocketRef]);

    const sendMessage = () => {
        if (inputText.trim() === '') {
            return
        }
        let userId = localStorage.getItem('userId');
        const messageObj = {
            id:  Math.random().toString(36),
            userId: userId,
            roomId: roomId,
            content: inputText.trim(),
            isSelf: true,
            action: "send",
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            timestamp: new Date().getTime()
        }

        webSocketRef.current.send(JSON.stringify(messageObj))
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
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="input-box">
                        <textarea type="text" className="input" placeholder='Type your message here...'
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