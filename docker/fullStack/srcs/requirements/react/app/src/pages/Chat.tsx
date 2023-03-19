import { createContext, useState } from "react";

import Left from "../components/Chat/Left";
import Middle from "../components/Chat/Middle";
import Right from "../components/Chat/Right";

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
//   avatar: "/team.jpeg",
// };
const initCurrConv = {
  isChan: true,
  id: 1,
  name: "wael chan --------------------",
  avatar: "/image/1678430369643_blindtest-logo.png",
};
interface ConvContextType {
  currConv: CurrConv;
  setCurrConv: React.Dispatch<React.SetStateAction<CurrConv>>;
}
export const ConvContext = createContext<ConvContextType>({
  currConv: initCurrConv,
  setCurrConv: () => {},
});

export default function Chat() {
  const [currConv, setCurrConv] = useState<CurrConv>(initCurrConv);

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
