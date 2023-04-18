import { createContext, useState } from "react";

import Left from "../components/Chat/Left";
import Middle from "../components/Chat/Middle/Middle";
import Right from "../components/Chat/Right/Right";

import "../styles/Chat/containers.css";

export interface CurrConv {
  isChan: boolean;
  id: number | string; // number if channel, string if user
  name: string;
  avatar: string;
}
interface ConvContextType {
  currConv: CurrConv | null;
  setCurrConv: React.Dispatch<React.SetStateAction<CurrConv | null>>;
}
export const ConvContext = createContext<ConvContextType>({
  currConv: null,
  setCurrConv: () => {},
});

export default function Chat() {
  const [currConv, setCurrConv] = useState<CurrConv | null>(null);

  return (
    <div id="chat-container">
      <ConvContext.Provider value={{ currConv, setCurrConv }}>
        <Left />
        <Middle />
        <Right />
      </ConvContext.Provider>
    </div>
  );
}
