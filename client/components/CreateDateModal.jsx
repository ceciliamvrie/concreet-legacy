import React from 'react';
import Modal from 'react-modal';
import AddEventModal from './AddEventModal.jsx';
// Modal styling
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : '70%',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    maxHeight             : '325px', // This sets the max height
    overflow              : 'scroll', // This tells the modal to scroll
    border                : '1px solid black',
    //borderBottom          : '1px solid black', // for some reason the bottom border was being cut off, so made it a little thicker
    borderRadius         : '0px'
  }
};

class CreateDateModal extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: true
    };

    // this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  // openModal() {
  //   console.log('open in create date')
  //   this.setState({modalIsOpen: true});
  // }


  afterOpenModal() {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }

  closeModal() {
    console.log('close in create date')
    this.props.closeModal()
    this.setState({modalIsOpen: false});
  }

  render() {
    return (
      <div className="timeModal">

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          onSubmit={this.closeModal}
          style={customStyles}
          contentLabel="Time Slots Modal"
        >

          <h2 className="modalTitle">Schedule A Date</h2>
          <AddEventModal
            user={this.props.user}
            updateSlotsAndEventInfo={this.props.updateSlotsAndEventInfo}
            selectedContacts={this.props.selectedContacts}
            selectedGroups={this.props.selectedGroups}
            location={this.props.location}
            date={this.props.selectedDate}
            style={this.customStyles}
          />
        </Modal>
      </div>
    );
  }
}

export default CreateDateModal;
