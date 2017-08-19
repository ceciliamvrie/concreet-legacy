import React from 'react';
import SidePanel from './SidePanel.jsx';
import BigCalBasic from './BigCalBasic.jsx';
import AddEvent from './AddEvent.jsx';
import * as UserModel from '../models/user.js';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedGroup: [],
      contact: {},
      selectedContacts: [],
      allGroups: [],
      allContacts: []
    }
    this.handleSelectedGroup = this.handleSelectedGroup.bind(this);
    this.handleSelectedContacts = this.handleSelectedContacts.bind(this);
    this.handleAddGroup = this.handleAddGroup.bind(this);
    this.handleAddContact = this.handleAddContact.bind(this);
    this.handleUpdateGroup = this.handleUpdateGroup.bind(this);
    this.removeContactFromGroup = this.removeContactFromGroup.bind(this);
    this.clearSelectedContacts = this.clearSelectedContacts.bind(this);
  }

  componentDidMount() {
    this.resetGroup();
    this.resetContact();
  }

  orderContacts(contact) {
    let orderContacts = [];
    let signedUpContacts = [];
    for (let each of contact.contacts) {
      if (each.isSignedUp) {
        signedUpContacts.push(each);
      } else {
        orderContacts.push(each);
      }
    }
    orderContacts = signedUpContacts.concat(orderContacts);
    return orderContacts;
  }

  resetContact() {
    UserModel.getContact(this.props.user.user._id, (contact) => {

      this.setState({
        allContacts: this.orderContacts(contact),
        contact: contact

      })
    })
  }

  resetGroup() {
    UserModel.getGroup(this.props.user.user._id, (group)=>{
      this.setState({
        allGroups: group
      })
    })
  }

  handleSelectedGroup(group) {

    if (!this.checkExist(this.state.selectedGroup, group)) {
      var addGroup = this.state.selectedGroup.slice();
      addGroup.push(group);
      this.setState({
        selectedGroup: addGroup
      })
    } else {
      var removeGroup = this.state.selectedGroup.slice();
      removeGroup.splice(removeGroup.indexOf(group), 1);

      this.setState({
        selectedGroup: removeGroup
      })
    }
  }


  checkExist(contacts, target) {
    let check = false;
    for (let contact of contacts) {
      if (contact._id === target._id) {
        check = true;
      }
    }
    return check;
  }

  handleSelectedContacts(contact, isContactList) {

    if (!this.checkExist(this.state.selectedContacts, contact) && isContactList) {
      var addContact = this.state.selectedContacts.slice();
      addContact.push(contact);
      this.setState({
        selectedContacts: addContact
      })
    } else if (this.checkExist(this.state.selectedContacts, contact) && isContactList) {
      var removeContact = this.state.selectedContacts.slice();
      removeContact.splice(removeContact.indexOf(contact), 1);

      this.setState({
        selectedContacts: removeContact
      })
    }
    //future implementation: this is for selecting single contacts from other groups implementation.

    // else if (!this.checkExist(this.state.selectedContactsFromGroups, contact) && !isContactList) {
    //   var addContactGroup = this.state.selectedContactsFromGroups.slice();
    //   addContactGroup.push(contact);
    //   this.setState({
    //     selectedContactsFromGroups: addContactGroup
    //   })
    // } else {
    //   var removeContactGroup = this.state.selectedContactsFromGroups.slice();
    //   removeContactGroup.splice(removeContactGroup.indexOf(contact), 1);

    //   this.setState({
    //     selectedContactsFromGroups: removeContactGroup
    //   })
    // }


    // setTimeout(()=> {console.log(this.state.selectedContacts, 'new one');})
    // setTimeout(()=> {console.log(this.state.selectedContactsFromGroups, 'new oneGORUPRUPRUPR');})

  }

  // future implementation: clearing out selected contacts everytime an action has taken place.
  clearSelectedContacts() {
    this.setState({
      selectedContacts: []
    })
  }

  handleAddGroup(groupname) {

    UserModel.addGroup(groupname, this.props.user.user, (sucess)=> {
      this.resetGroup();
    })
  }

  handleAddContact(gmail) {

    let checkdup = false;
    this.state.allContacts.forEach((contact) => {
      if (gmail === contact.emailAddress) {
        checkdup = true;
      }
    });

    let checkgmail = false;
    if (gmail.slice(-10).toUpperCase() !== '@GMAIL.COM') {
      checkgmail = true;
    }

    if (!checkdup && !checkgmail) {

      UserModel.addContact(gmail, (contact) => {
        UserModel.addContactToGroup(this.state.contact, contact, ()=>{
          this.resetContact();
        })
      })

    } else if (checkdup) {
      alert('Error: Contact already exist.')
    } else if (checkgmail) {
      alert('Error: Please enter a google email.')
    }
  }

  handleUpdateGroup(group) {
    this.state.selectedContacts.forEach((contact)=>{
      if (!this.checkExist(group.contacts, contact)) {
        UserModel.addContactToGroup(group, contact, ()=>{
          this.resetGroup();
        })
      }
    })
  }

  removeContactFromGroup(group) {
    this.state.selectedContacts.forEach((contact) => {
      if (this.checkExist(group.contacts, contact)) {
        UserModel.removeContactFromGroup(group, contact, ()=>{
          this.resetGroup();
          this.resetContact();
        })
      }
    })
  }

  render() {
    return (
      <div className="dashboard">
        <h1 className="title">Concreet</h1>
        <SidePanel contacts={this.state.allContacts} groups={this.state.allGroups} selectContact={this.handleSelectedContacts} selectGroup={this.handleSelectedGroup} addGroup={this.handleAddGroup} addContact={this.handleAddContact} updateGroup={this.handleUpdateGroup} removeContactFromGroup={this.removeContactFromGroup} selectedContacts={this.state.selectedContacts} resetSide={this.resetGroup.bind(this)} contactGroup={this.state.contact} clearSelectedContacts={this.clearSelectedContacts}/>
        <BigCalBasic user={this.props.user} selectedGroups={this.state.selectedGroup} selectedContacts={this.state.selectedContacts} allContacts={this.state.allContacts}/>

      </div>

    );
  }
}

export default Dashboard;
