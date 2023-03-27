import { createContext, useState } from "react";

import Left from "../components/Chat/Left";
import Middle from "../components/Chat/Middle";
import Right from "../components/Chat/Right/Right";

import "../styles/Chat/containers.css";

interface CurrConv {
  isChan: boolean;
  id: number | string; // number if channel, string if user
  name: string;
  avatar: string;
}
// const initCurrConv = {
//   isChan: false,
//   id: "CatPong's Team",
//   name: "CatPong's Team",
//   avatar: "/image/team.jpeg",
// };
// const initCurrConv = {
//   isChan: true,
//   id: 1,
//   name: "wael channel -----------------",
//   avatar: "/image/default.jpg",
// };
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
