import { FAB } from "components/fab";
import Grid from "components/grid";
import styled from "styled-components";
import "./style.css";

const Container = styled.div`
  display: grid;

  grid-template-areas: "h h" "s c";
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  @media (hover: none) {
    grid-template-areas: "h h" "s c";
    grid-template-rows: auto 1fr;
    grid-template-columns: 0 1fr;
  }

  .navbar {
    grid-area: h;
  }

  .sidebar {
    grid-area: s;
  }

  .content {
    grid-area: c;
  }
`;

const Home = () => {
  return (
    <Container className="home">
      {/* <Navbar className="navbar"/> */}
      {/* <Sidebar className="sidebar"/> */}
      <Grid className="content" />
      <FAB />
    </Container>
  );
};

export default Home;
