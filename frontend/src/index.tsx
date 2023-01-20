import { Lounge } from './Lounge';
import { createRoot } from "react-dom/client";

createRoot(
  document.getElementById("root") as HTMLElement
).render(<Lounge name={prompt("Enter your name") as string}/>);
