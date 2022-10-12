import styled from "styled-components";

interface props {
  className ?: string
}

const Container = styled.div`
  width: 100%;
  height: 100px;
  background-color: red;
`;

const Navbar = ({className} : props) => <Container className={`navbar ${className}`}  />

export default Navbar;