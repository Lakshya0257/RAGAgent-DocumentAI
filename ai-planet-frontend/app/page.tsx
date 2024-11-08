"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileInfo {
  userId: string;
  fileUrl: string;
  status: string;
  filename: string;
  filetype: string;
  id: string;
  createdDate: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  content: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selected, selectFile] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchFiles(userId);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userid", userId);

      console.log("sending");

      try {
        const response = await fetch("http://localhost:9000/file/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setFiles((prevFiles) => [...prevFiles, data.data.fileUrl]);
          console.log("File uploaded successfully");
        } else {
          console.error("Error uploading file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const fetchFiles = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:9000/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setFiles(data.data);
      } else {
        console.error("Error fetching files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const selectFiles = (fileId: string) => {
    selectFile(fileId);
    setChatMessages([]);
  };

  const handleFileDelete = async (fileId: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    try {
      const response = await fetch(`http://localhost:9000/user/${userId}/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        console.log("File deleted successfully");
      } else {
        console.error("Error deleting file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleFileOpen = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleChatInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(event.target.value);
  };

  const handleChatSubmit = async () => {
    if (selected && chatInput.trim() !== "") {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", content: chatInput },
      ]);

      try {
        const response = await fetch("http://127.0.0.1:5000/qa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: chatInput, fileId: selected }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          let message = "";
          for(const ms of data.answer.response){
            if(ms["done"]===false){
              message+=ms["response"]
            }
          }
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", content: message },
          ]);
        } else {
          console.error("Error getting response from bot");
        }
      } catch (error) {
        console.error("Error sending message to bot:", error);
      }

      setChatInput("");
    }
  };

  return (
    <div className=" fixed top-0 left-0 w-full h-full bg-black flex">
      <div className=" w-full h-full p-10">
        <div className=" h-[30%] flex items-center justify-center">
          <label className="bg-zinc-800 rounded-lg px-4 py-2 cursor-pointer text-white">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            Choose File
          </label>
          <Button
            variant={"outline"}
            className="ml-4"
            onClick={handleFileUpload}
            disabled={!file}
          >
            Upload
          </Button>
        </div>
        <div className=" w-full h-full overflow-auto text-white">
          <h1 className="text-base">Files in your account!</h1>
          {files.length > 0 ? (
            files.map((file) => (
              <div
                key={file.id}
                className={` w-[100%] h-fit  flex justify-center items-center rounded-lg p-2 mt-2 mb-2 ${file.id===selected? "bg-purple-950" : "bg-zinc-800"}`}
              >
                <div className=" w-[100%] text-sm">{file.filename}</div>
                <div className=" w-full flex items-center justify-end">
                  <Button
                    variant={"outline"}
                    className="text-black mr-2"
                    onClick={() => handleFileOpen(file.fileUrl)}
                  >
                    Open
                  </Button>
                  <Button
                    variant={"outline"}
                    className="text-black mr-2"
                    onClick={() => selectFiles(file.id)}
                  >
                    Select
                  </Button>
                  <Button variant={"destructive"} onClick={() => handleFileDelete(file.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div>No files uploaded yet.</div>
          )}
        </div>
      </div>
      <div className=" w-full rounded-3xl border-[1px] m-10 flex flex-col items-center justify-between p-6 bg-zinc-900">
        <div className="h-[80%] w-full">
          {selected ? (
            <ScrollArea className="h-full w-full">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex  ${
                    message.sender === "user" ? "text-end justify-end" : " text-start justify-start"
                  }`}
                >
                  <p className={`max-w-[50%] p-2 rounded-lg m-2 ${
                    message.sender === "user" ? "text-end bg-white" : " text-start bg-white"
                  }`}>{message.content}</p>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white">
              Select a file to start chatting
            </div>
          )}
        </div>
        <div className=" w-full flex items-center justify-between p-2">
          <Input
          className=" text-white"
            placeholder="Type your message..."
            value={chatInput}
            onChange={handleChatInputChange}
          />
          <Button variant={"outline"} onClick={handleChatSubmit}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}