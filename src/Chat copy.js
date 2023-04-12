import React, { useState, useEffect, useRef } from 'react'
import './Chat.css'
const Chat = () => {
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const chatBoxRef = useRef(null)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/websocket')
        

        socket.addEventListener('message', event => {
            const message = JSON.parse(event.data)
            console.log(event.data)
            setMessages([...messages, message])
        })

        socket.addEventListener('open', () => {
            console.log('WebSocket connected')
        })

        socket.addEventListener('close', () => {
            console.log('WebSocket closed')
        })

        return () => {
            socket.close()
        }
    }, [messages])

    const sendMessage = () => {
        if (inputText.trim() === '') {
            return
        }
        const messageObj = {
            username: 'anonymous',
            content: inputText.trim(),
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            timestamp: new Date().getTime()
        }

        const socket = new WebSocket('ws://localhost:8080/websocket')
        socket.addEventListener('open', () => {
            socket.send(JSON.stringify(messageObj))
            setMessages([...messages, messageObj])
            setInputText('')
            socket.close()
        })
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
                <div className="sidebar">
                    <div className="chat-list">
                        <div className="chat" >
                            <div className="chat-title">Alice</div>
                            <div className="chat-timestamp">1 hour ago</div>
                            <div className="chat-content">Hello, how are you?</div>
                        </div>
                    </div>
                    <button className="add-new-chat-button">Add new chat</button>
                </div>
                <div className="chatbox">
                    <div className="title">Title</div>
                    <div className="content">
                        {messages.map(message => (
                            <div key={message.id} className={`message ${message.isSelf ? 'self' : ''}`}>
                                <div className="avatar">
                                    <img src={message.avatarUrl} alt="avatar" />
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
                        <button class="sendBtn" onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Chat