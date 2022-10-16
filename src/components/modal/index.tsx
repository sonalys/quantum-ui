import styled from "styled-components";

interface Props {

}

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const Modal = ({} : Props) => {
  return <Container/>
};