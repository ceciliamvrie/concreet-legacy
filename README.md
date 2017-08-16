# concreet-cal
Finds available meeting times and allows quick sending of gcal invites to attendees

## Team
  * __Product Owner__: Jordan Hoang (GitHub: JordanHoang)
  * __Scrum Master__: Ben Childs (GitHub: bchilds)
  * __Development Team Members__: Demetrio Urquidi (GitHub: dmtrio ), Lina Yang (GitHub: t886515), Ben Childs, Jordan Hoang


### Use Instructions
* Start a local mongodb instance: `brew services start mongodb`
* Start a local node server: `npm start`
* Go to `localhost:8000`
* Sign in with your Google account
* Add a contact, and get that contact to also sign in to the application using that Google account
* Select that contact, and create an event using the event creation fields above the calendar
* Select an available time from the resulting modal. The event is created on the user's and all selected contacts' GCals

### Suggested Features
* Allow contact interaction/event creation to non-Google accounts
* Outlook integration
* Calendar selector
* Automated signup email upon Contact add of a non-existing user
* Flex dates (given a date range, find all available times over that range)
* Get event details when clicking on events in BigCal
* Required/Optional attendees (designate some attendees as required, and some as optional for finding open times)
* Make a local calendar

### Bug fixes
Make add/remove contacts more intuitive
Calendar date picker
Dropdown menu for Group options (add/remove contact, delete group, rename group)

### Component Descriptions
#### Client
  * components
    * `App.jsx`
      * has the state of signed-in user stored
      * handle page rendering depends on the signed-in state of users
      * handle user signed out
      * render either `Dashboard.js` and `SplashLogin.js`
    * `Dashboard.jsx`
      * has the state of `selectedGroups`, `selectedContacts`, `allContacts`, `allGroups`, `contactObject`(as a whole) stored
      * handle fetching all contacts and all groups from database: contact list are ordered by signed-up status
      * handle selected group and selected contacts: checkExist handle unselect a group or contact if it was already in the selected list
      * handle adding a group to the database, and adding contact to a certain group or remove contact to a certain group
      * handle adding a contact to the database: check for duplicates and e-mail validity of the contact added
      * render both `SidePanel.js` and `BigCalBasic.js`
    * `SidePanel.jsx`
      * render two `GroupPanel.js` and pass down a boolean `isContactList` to lower components to distinguish contact group panels and normal group panels.
    * `GroupPanel.jsx`
      * has two boolean states for toggling the add contact and add group function on and off
      * handle toggling the add contact or add group form on and off
      * handle deleting a group panel entry from retrieving data from group panel entry and fire post request  
      * handle adding a group panel entry: also check for the viablity of the group name and restrict group name to not exceed 20 words.
      * handle adding a contact to the contact list group.
      * render either `ContactEntry.jsx` or `GroupPanelEntry.jsx` depending on the `isContactList` props passed-down from the side panel.
    * `GroupEntry.jsx`
      * has two boolean states for showing all contacts under a group and show if a group is selected
      * handle toggling contact list visibility
      * handle the group selected: update the selected group state in `Dashboard.jsx` and toggling the select indicator
      * handle adding contacts(selecting contacts from the contact list group panel) to a group
      * handle removing contacts(selecting contacts from the contact list group panel) from a group
      * handle deleting a group from database
      * render `ContactEntry.jsx`
    * `ContactEntry.jsx`
      * has a boolean for showing if a contact is selected or not for contact list
      * handle selecting contact: toggle the state of showing a selected contact and update the state of selected contact in `Dashbaord.jsx` depends on the entry selected
    * Calendar
      * `Calendar.js`
        * makes api calls to google for calendar data. Validates data with the app server.
      * `BigCalBasic`
        * calls the NPM component `custom-react-big-calendar`. Sets options and passes updated/fetched events down to it. Also renders the `AddEvent` and `FreeTimeSlotsModal`.
    * `findFreeTimes.js `
      * find available meeting times given a meeting length and freeBusy data.
      * Free/busy data is a calendars array with each element being an object with a unique email address as a key. The value of that email key is an object with a busy key.
      * The value of busy key is an array of objects that include start and end property of busy times

  * models
    * `user.js`
      * handle GET request to retrieve individual user data
      * handle GET request to retrieve all groups other than contact list group of a user
      * handle POST request to add a group entry to database
      * handle POST request to remove a group entry from database
      * handle POST request to add/update contact(s) of a group
      * handle POST request to remove contact(s) from a group
      * handle GET request to find or create a contact in user table
      * handle GET request to retrieve all contacts of a user
      * handle GET request to destroy user session

#### Server
* `index.js` runs the server
* `server.js`
	* creates the session
	* launches passport
	* sets up routing
	* starts the server
* `passport.js`
	* sets up `Google OAuth2.0`
	* handles user login process and initial data creation/verification
		* A new user has a new User record created and filled in with appropriate details.
		* A user whose email was in-system from an Add Contact, but had not logged in yet, has their details updated and is verified.
		* A normal user is logged in.
		* Contact List and Groups Lists are returned to the client.
* `passportConfig.js`
	contains google client ID and google secret
* `responseHandler.js`
	* handles all GET/POST requests from server routing
	* finds, creates groups and contact
	* refreshes tokens using a user's refreshToken
	* logout
* `utils.js`
	* contains functions for retrieving user groups and contact list, used in several places

#### Database
* `config.js`
	* configures the database connection to local mongodb
* `group.js`
	* configures Group documents
	* `owner_id` pointing to User
	* `group_name`
	* `isContactList` boolean to denote contact lists from regular groups
	* `contacts` array pointing to users contained by a group
* `user.js`
	* configures User documents
		* uses `findOrCreate` module to creature users if not found
		* `users` contain
			* `googleId`
			* `emailAddress`
			* `isSignedUp` boolean to determine validation of account (we need permission to access calendars, so this lets us only interact with people who have given us permissions)
			accessToken for making API calls
			* `refreshToken` for generating new access tokens as needed
