"use client";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi, I'm SportStat, what facts or statistics do you want to know?`,
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    const userMessage = message.trim().toLowerCase();
    setMessage(""); 
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
    ]);

    // hard-coded responses based on user message
    let assistantResponse = "";

    if (userMessage === "who won the nba finals in 2023?") {
      assistantResponse = "The Denver Nuggets won the NBA Finals in 2023.";
    } else if (userMessage === "who scored the most points in an nba game?") {
      assistantResponse = "Wilt Chamberlain scored 100 points on March 2, 1962, while playing for the Philadelphia Warriors against the New York Knicks. This is the highest single-game point total in NBA history.";
    } else if (userMessage === "who is the top scorer in soccer?") {
      assistantResponse = "Cristiano Ronaldo is often regarded as the top scorer in soccer, with over 800 career goals.";
    } else {
      // if no hard-coded response, proceed to fetch from API
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: "..." },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      }).then(async (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let result = "";
        return reader.read().then(function processText({ done, value }) {
          if (done) {
            return result;
          }
          const text = decoder.decode(value || new Int8Array(), {
            stream: true,
          });
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              },
            ];
          });
          return reader.read().then(processText);
        });
      });
      return;
    }

    // set the hard-coded response
    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: assistantResponse },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box textAlign="center" margin={2}>
        <h1>SportStat</h1>
        <p>Your ultimate source for sports stats and insights</p>
      </Box>
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant" ? "primary.main" : "secondary.main"
                }
                color="white"
                borderRadius={10}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
