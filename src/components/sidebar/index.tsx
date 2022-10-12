import styled from "styled-components";

interface props {
  className ?: string
}

const Container = styled.div`
  min-width: 100px;
  height: 100%;
  background-color: green;
`;

const Sidebar = ({className} : props) => <Container className={`navbar ${className}`}/>

export default Sidebar;