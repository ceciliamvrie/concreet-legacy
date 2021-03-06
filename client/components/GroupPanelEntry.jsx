import React from 'react';
import ContactEntry from './ContactEntry.jsx';

class GroupPanelEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      showSelect: false
    }
  }

  handleOnClick() {
    this.setState({
      clicked: !this.state.clicked
    })
  }

  handleSelectGroup() {
    this.props.selectGroup(this.props.group);
    this.setState({
      showSelect: !this.state.showSelect
    });
  }

  handleUpdateGroup() {
    this.props.updateGroup(this.props.group);
    this.setState({
      clicked: true
    })

  }

  handleRemoveContactFromGroup() {
    this.props.removeContactFromGroup(this.props.group);
  }

  handleDeleteGroup() {
    if (confirm("Warning: Are you sure you want to delete group '" + this.props.group.group_name + "' from your group list? This process can not be reversed." )) {
      this.props.deleteGroup(this.props.group);
    } else {
      return;
    }
  }


  render() {

    return (
      <div className="grouppanelentry">

        { this.state.showSelect && <div className="groupname"> 
          <p style={{display: 'inline', cursor: 'pointer'}} onClick={this.handleSelectGroup.bind(this)}> <i className="fa fa-check-square-o" aria-hidden="true"></i> {this.props.group.group_name} </p> 
          { this.state.clicked && <button className="showbutton" onClick={this.handleOnClick.bind(this)}> <i className="fa fa-window-minimize" aria-hidden="true"></i> </button> }
          { !this.state.clicked && <button className="showbutton" onClick={this.handleOnClick.bind(this)}> <i className="fa fa-window-maximize" aria-hidden="true"></i> </button> }  
          <div className="groupSettings">
            <button className="addremovecontact" onClick={this.handleUpdateGroup.bind(this)}> 
              <i className="fa fa-user-o" aria-hidden="true"></i> <i className="fa fa-plus-square-o" aria-hidden="true"></i>
            </button>
             <button className="addremovecontact" onClick={this.handleRemoveContactFromGroup.bind(this)}> 
              <i className="fa fa-user-o" aria-hidden="true"></i> <i className="fa fa-minus-square-o" aria-hidden="true"></i>
            </button>
            <button className="addremovecontact" onClick={this.handleDeleteGroup.bind(this)}>
              <i className="fa fa-users" aria-hidden="true"></i> <i className="fa fa-minus-square-o" aria-hidden="true"></i>
            </button>
          </div>


        </div> }  

        {!this.state.showSelect && <div className="groupname"> 

          <p style={{display: 'inline', cursor: 'pointer'}} onClick={this.handleSelectGroup.bind(this)}> <i className="fa fa-square-o" aria-hidden="true"></i> {this.props.group.group_name} </p> 
          { this.state.clicked && <button className="showbutton" onClick={this.handleOnClick.bind(this)}> <i className="fa fa-window-minimize" aria-hidden="true"></i> </button> }
          { !this.state.clicked && <button className="showbutton" onClick={this.handleOnClick.bind(this)}> <i className="fa fa-window-maximize" aria-hidden="true"></i> </button> } 
          <div className="groupSettings">
            <button className="addremovecontact" onClick={this.handleUpdateGroup.bind(this)}> 
              <i className="fa fa-user-o" aria-hidden="true"></i> <i className="fa fa-plus-square-o" aria-hidden="true"></i>
            </button>
             <button className="addremovecontact" onClick={this.handleRemoveContactFromGroup.bind(this)}> 
              <i className="fa fa-user-o" aria-hidden="true"></i> <i className="fa fa-minus-square-o" aria-hidden="true"></i>
            </button>
            <button className="addremovecontact" onClick={this.handleDeleteGroup.bind(this)}>
              <i className="fa fa-users" aria-hidden="true"></i> <i className="fa fa-minus-square-o" aria-hidden="true"></i>
            </button>
          </div>
        </div> }

        { this.state.clicked && this.props.group.contacts.map((contact, i) => <ContactEntry key={i} groupPanelCheck="correct" contact={contact} selectContact={this.props.selectContact}/>) }  
      </div>

    );
  }
}

export default GroupPanelEntry;