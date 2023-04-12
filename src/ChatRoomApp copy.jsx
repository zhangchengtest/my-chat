import React, {useState, useEffect} from "react";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/chat');
    const stompClient = Stomp.over(socket);
    setStompClient(stompClient);

    stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);
      setConnected(true);

      stompClient.subscribe('/topic/public', (message) => {
        setMessages(messages => messages.concat(JSON.parse(message.body)));
      });
      
    });
    return () => {
      // 清理代码
    };
  }, []);

  const sendMessage = () => {
    const chatMessage = {sender: username, content: message, type: "CHAT"};
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    
    setMessage("");
  }

  const joinChat = () => {
    const chatMessage = {sender: username, type: "JOIN"};
    stompClient.send("/app/chat.addUser", {}, JSON.stringify(chatMessage));
  }

  const leaveChat = () => {
    const chatMessage = {sender: username, type: "LEAVE"};
    stompClient.send("/app/chat.removeUser", {}, JSON.stringify(chatMessage));
  }

  const onUsernameChange = (event) => setUsername(event.target.value);
  const onMessageChange = (event) => setMessage(event.target.value);

  return (
    <div>
      {!connected &&
        <div>
          <input type="text" placeholder="Username" onChange={onUsernameChange} value={username} />
          <button onClick={joinChat}>Join Chat</button>
        </div>
      }

      {connected &&
        <div>
          <button onClick={leaveChat}>Leave Chat</button>
          <ul>
            {messages.map((message, i) => (
              <li key={i}>{message.sender}: {message.content}</li>
            ))}
          </ul>
          <input type="text" placeholder="Message" onChange={onMessageChange} value={message} />
          <button onClick={sendMessage}>Send</button>
        </div>
      }
    </div>
  );
};

export default Chat;
