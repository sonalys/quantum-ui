import { Button, Input, Modal } from "semantic-ui-react";

interface Props {
  modalOpen : boolean
  setModalOpen : (v : boolean) => void
}

export const CategoryModal = ({modalOpen, setModalOpen} : Props) => {
  return <Modal open={modalOpen} dimmer basic size='mini'>
    <Modal.Header>New Category</Modal.Header>
    <Modal.Content>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input label="Name" fluid labelPosition='left corner' />
        <Input label="Path" fluid labelPosition='left corner' />
      </div>
    </Modal.Content>
    <Modal.Actions>
      <Button color='black' onClick={() => setModalOpen(false)}>
        Cancel
      </Button>
      <Button
        labelPosition='right'
        icon='checkmark'
        onClick={() => setModalOpen(false)}
        color="blue"
      >Create</Button>
    </Modal.Actions>
  </Modal>;
}