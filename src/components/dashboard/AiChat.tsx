import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function ChatWindow({ otherUserId }: { otherUserId: string }) {
  const { user } = useAuth();
  const messages = useQuery(api.messages.list, { otherUserId: otherUserId as any });
  const sendMessage = useMutation(api.messages.send);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        to: otherUserId as any,
        content: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message.");
      console.error(error);
    }
  };

  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-end gap-2 ${
                message.from === user?._id ? "justify-end" : ""
              }`}
            >
              {message.from !== user?._id && (
                <Avatar className="h-8 w-8">
                  <img src="/logo.png" alt="Avatar" />
                </Avatar>
              )}
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  message.from === user?._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-right opacity-70 mt-1">
                  {new Date(message._creationTime).toLocaleTimeString()}
                </p>
              </div>
              {message.from === user?._id && (
                <Avatar className="h-8 w-8">
                  <img src="/logo.png" alt="Avatar" />
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default function AiChat() {
  const allUsers = useQuery(api.users.getAll);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (allUsers === undefined) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="border rounded-lg h-[600px] flex">
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <ScrollArea className="h-[calc(600px-65px)]">
          {allUsers.map((user) => (
            <div
              key={user._id}
              className={`p-4 cursor-pointer hover:bg-muted ${
                selectedUserId === user._id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedUserId(user._id)}
            >
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3">
        {selectedUserId ? (
          <ChatWindow otherUserId={selectedUserId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}