import Form from "react-bootstrap/Form";
import { BiSearchAlt } from "react-icons/bi";
import "../../styles/Chat/SearchBar.css";

const SearchBar = ({ onChange }: SearchBarProps) => (
  <div className="search-container">
    <p className="search-text">Search</p>
    <Form.Control type="search" className="search-bar" onChange={onChange} />
    <BiSearchAlt color="var(--violet)" size={30} />
  </div>
);

export default SearchBar;
