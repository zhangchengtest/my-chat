import React, { useState, useEffect, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { Container, Row, Col, Nav, Tab, ListGroup, InputGroup, FormControl, Button } from 'react-bootstrap';

function ChatRoomApp() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const socket = useRef(null);
  const stompClient = useRef(null);

  const connect = () => {
    socket.current = new SockJS('/chat-room');
    stompClient.current = Stomp.over(socket.current);
    stompClient.current.connect({}, onConnect, onError);
  }

  const disconnect = () => {
    stompClient.current.disconnect();
  }

  const onConnect = () => {
    console.log('connected');
    stompClient.current.subscribe(`/topic/${selectedRoom}/users`, onUsers);
    stompClient.current.subscribe(`/topic/${selectedRoom}/messages`, onMessage);
    stompClient.current.send(`/app/chat-room/${selectedRoom}/join`, {}, JSON.stringify({
      username: 'Guest ' + Math.floor(Math.random() * 1000)
    }));
  }

  const onUsers = (message) => {
    setUsers(JSON.parse(message.body));
  }

  const onMessage = (message) => {
    setMessages(messages => [...messages, JSON.parse(message.body)]);
  }

  const onError = (error) => {
    console.log('error', error);
  }

  const handleRoomSelect = (roomId) => {
    setMessages([]);
    setSelectedRoom(roomId);
    disconnect();
    connect();
  }

  const handleSendMessage = () => {
    stompClient.current.send(`/app/chat-room/${selectedRoom}/message`, {}, JSON.stringify({
      content: messageInput
    }));
    setMessageInput('');
  }

  useEffect(() => {
    fetch('/api/chat-room/rooms')
      .then(response => response.json())
      .then(data => setRooms(data))
      .catch(error => console.log(error));
    return () => {
      if (stompClient.current != null) {
        stompClient.current.disconnect();
      }
    }
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <Nav variant="tabs">
            {rooms.map(room => (
              <Nav.Item key={room.id}>
                <Nav.Link onClick={() => handleRoomSelect(room.id)}>{room.name}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>
      </Row>
      <Row>
        <Col>
          {users.length > 0 && (
            <ListGroup>
              {users.map(user => (
                <ListGroup.Item key={user.username}>{user.username}</ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col>
          <ListGroup>
            {messages.map(message => (
              <ListGroup.Item key={message.id}><strong>{message.username}: </strong>{message.content}</ListGroup.Item>
            ))}
          </ListGroup>
          <InputGroup>
            <FormControl value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
            <InputGroup.Append>
              <Button variant="primary" onClick={handleSendMessage}>Send</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatRoomApp;
