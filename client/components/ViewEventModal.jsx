import React from 'react';
import Modal from 'react-modal';
import InlineBlock from 'react-inline-block';
import Columns from 'react-columns';
import CreateEventModal from './CreateDateModal.jsx';
import Iframe from 'react-iframe';
import EditEvent from './EditEvent.jsx';

// Modal styling
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : '70%',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    maxHeight             : '425px', // This sets the max height
    width                 : '700px',
    overflow              : 'scroll', // This tells the modal to scroll
    border                : '1px solid black',
    //borderBottom          : '1px solid black', // for some reason the bottom border was being cut off, so made it a little thicker
    borderRadius         : '0px'
  }
};

class ViewEventModal extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: true,
      toggleEdit: false

    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.props.closeViewModal()
    this.setState({modalIsOpen: false});
  }

  toggleEditEvent() {
    console.log('toggled')
    this.setState({
      toggleEdit: !this.state.toggleEdit
    })
  }

  render() {
    return (
      <div className="viewModal">

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Time Slots Modal"
        >

        {!this.state.toggleEdit ?
          <div>
            <div className="modalTitle">
              <button className="createEventButton" onClick={this.toggleEditEvent.bind(this)}> Edit </button>
            </div>
            <h2 className="modalTitle">{this.props.eventPicked.summary}</h2>

            <h3 className="modalTitle"> When: {this.props.eventPicked.start
              .toString().split(' ').slice(0, 4).join(' ')} 
            </h3>

   
            <div>
              <Columns columns="2">
                {this.props.eventPicked.attendees.map(atnd => 
                  <div id="attendee">
                  {atnd.email}: <label style={{fontStyle: 'italic', fontSize: '14px'}}>{atnd.responseStatus}</label></div>
                )}
              </Columns>
            </div>

            <div className="modalTitle">
              <Iframe url="https://vignette1.wikia.nocookie.net/prowrestling/images/a/a1/John_Cena_Awards.png/revision/latest?cb=20131106181414"
               width="200px"
               height="200px"
               display="initial"
               position="relative"
               allowFullScreen
               />
             </div>
          </div>: 

          <EditEvent 
          toggleEdit={this.toggleEditEvent.bind(this)}
          closeModal={this.closeModal.bind(this)} 
          eventPicked={this.props.eventPicked}
          updateSlotsAndEventInfo={this.props.updateSlotsAndEventInfo}
          />
        }

        {
          console.log(this.props.selectedDate)
        }
        </Modal>
      </div>
    );
  }
}

export default ViewEventModal;

