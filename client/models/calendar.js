
// controllers to get back calendar data from Google Calendars API
// see https://docs.google.com/document/d/1Z7jaqjRvIZuvRJZW8X6a3JDIfilJTGclH0C-zYTAq04/edit for
// walkthrough an examples of response bodies for different API requests

import $ from 'jquery';
import moment from 'moment';

//Note: access to google data is dependent on an access token. Access tokens expire after an hour.
//A refresh token is required to get a new access token. These never expire but are only given once to an app.


//get data for each member of a group from the database
const checkQueryGroup = (queryGroup, callback) => {
  var checkedQueryGroup = []
  for (var user of queryGroup) {
    //calls on getUserFromDB to continue checks for each user
    getUserFromDB(user, (reauthUser) => {
      checkedQueryGroup.push(reauthUser)
      if (checkedQueryGroup.length === queryGroup.length) {
        //returns checkedQueryGroup once all members have been returned
        callback(checkedQueryGroup);
      }
    });
  }
}

//get latest data from server for a user.
const getUserFromDB = (user, callback) => {
  $.get(`/users/user/${user.emailAddress}`, (user) => {
    // calls on checkAccessToken to verify the accessToken is still valid
    checkAccessToken(user, true, (reauthUser) => {
      // returns verified user
      callback(reauthUser);
    })
  })
}

const checkAccessToken = (user, retry, callback) => {
  // makes a get request to google to verify the access token just retrieved from the server
  $.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${user.accessToken}`, (data) => {
    // if the token is good then simply return back the same user that has the valid token
    callback(user);
  }).fail((err) => {
    // if it fails, the token is expired.
    console.error(err);
    if (retry) {
      // run refreshToken to make a call to the server and ask for a new accessToken
      refreshToken(user, (reauthUser) => {
        //once we get the accessToken back run it through checkAccessToken to make sure the refreshToken worked
        //this time it wont retry to refresh the token
        checkAccessToken(reauthUser, false, (reauthUser)=>{
          // returns the reauthUser user
          callback(reauthUser);
        })
      });
    } else {
      console.log('could not reauth user');
      callback(user)
    }
  })
}

const refreshToken = (user, callback) => {
  //make a call to the app server to run a refresh token function on the server
  $.get(`/users/reauth/${user._id}`, (reauthUser) => {
    //return reauthUser
    callback(reauthUser);
  })
}

//general fucntion to make an ajax call. simple refactoring
const makeAjaxCall = (type, url, accessToken, requestBody, callback) => {
  $.ajax({
    type: type,
    url: url,
    headers: {Authorization: `Bearer ${accessToken}`},
    data: JSON.stringify(requestBody),
    contentType: 'application/json',
    dataType: 'json',
    success: function(data) {
      console.log('successful call to ' + url)
      callback(data);
    },
    error: function(err) {
      console.log('error call to ' + url)
      callback(err);
    }
  });
}

// retrieves all calendars for a single user
// is currently not being used.
export const getCalendarList = (currentUser, callback) => {

  getUserFromDB(currentUser, (currentUser) => {

    console.log('get calendar list', currentUser);
    // token is special key provided by google to identify a user and a session
    var searchParams = {access_token: currentUser.accessToken};

    $.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', searchParams, (data) => {
      // data is an object with an items property that contains an array of calendar data
      callback(currentUser, data.items);
    }).fail((err) => {
      console.log(err);
    })

  });
};

//used to populate BigCalBasic with events
export const getCalendarEvents = function (currentUser, calendarList, callback) {
  //currently the calendar id we are using is the primary calendar
  //the primary calendar id is the emailAddress of the user
  var calendar = {
    id: currentUser.emailAddress
  }

  // replace any pound sign with its escape character. Pound sign interferes with URL search. not current needed
  // calendar.id = calendar.id.replace('#', '%23')

  var startOfMonth = moment().startOf('month').format("YYYY-MM-DDTHH:mm:ssZ");
  var endOfMonth = moment().endOf('month').format("YYYY-MM-DDTHH:mm:ssZ");

  // params inclue user token, single events to true to avoid returning all recurring events
  // give it a time range from one startOfMonth to endOfMonth.
  // order by start time(ascending). Earliest event will be 0th element in items array
  var searchParams = {
    access_token: currentUser.accessToken,
    singleEvents: true,
    timeMin: startOfMonth,
    timeMax: endOfMonth,
    orderBy: 'startTime'
  };

  $.get(`https://www.googleapis.com/calendar/v3/calendars/${calendar.id}/events`, searchParams, (data) => {
    // data is an object with an items property that contains an array of calendar data
    callback(data.items);
  });
}

//events need to be stored as a javascript Date obj to be read by BigCalBasic
//this function converts them to the correct format
export const processEvents = function (eventsList, callback) {
  for (var event of eventsList) {
    event.end = new Date (event.end.dateTime);
    event.start = new Date (event.start.dateTime);
  }
  callback(eventsList);
}

//checks a group for their freeBusy times
export const freeBusy = (queryGroup, currentUser, timeMin, timeMax, callback) => {

  var allContactsCalendars = [];

  // add current user to queries
  queryGroup.push(currentUser)

  //IMPORTANT check queryGroup to validate accessTokens
  //returns a checkedQueryGroup
  checkQueryGroup(queryGroup, (checkedQueryGroup) => {
    var counter = 0;

    // query freeBusy for each member of thr checkedQueryGroup
    for (var member of checkedQueryGroup) {
      var id = member._id;
      var email = member.emailAddress;
      var accessToken = member.accessToken;
      var refreshToken = member.refreshToken;

      // request body includes the calendar ids of the user for which you want to check free busy times.
      //multiple calendars can be checked at the same time
      var requestBody = {
      "items": [
        { "id": email },
        // { id": "hackreactor.com_9kddcjfdij7ak91o0t2bdlpnoo@group.calendar.google.com" }
      ],
        "timeMin": timeMin,
        "timeMax": timeMax,
      }

      makeAjaxCall('POST', `https://www.googleapis.com/calendar/v3/freeBusy`, accessToken, requestBody, (data) => {
        allContactsCalendars.push(data.calendars);

        //counts to see if the amount of successful returned calls is equal to the number of group memebers
        counter++;
        if (counter === queryGroup.length) {
          //then runs the callback with all the data in it
          callback(allContactsCalendars);
        }
      })
    } //for loop end
  }) //checkQueryGroup function
}

// makes a call from the current user to add event to all users on the queryGroup
export const addEvent = (queryGroup, currentUser, title, timeStart, timeEnd, callback) => {
  var accessToken = currentUser.accessToken;
  var calendarId = currentUser.emailAddress;
  var attendees = []

  //adds all memebers of the queryGroup to the attendee param for the ajax call
  for (var member of queryGroup) {
    var attendee = {
      email: member.emailAddress,
      responseStatus: 'accepted'
    };
    attendees.push(attendee);
  }

  var start = {
    "dateTime": timeStart,
    "timeZone": "America/Chicago"
  };
  var end = {
    "dateTime": timeEnd,
    "timeZone": "America/Chicago"
  };

  var requestBody = {
    "attendees": attendees,
    "start": start,
    "end": end,
    "reminders": {
      "useDefault": true
    },
    "summary": title
  };

<<<<<<< HEAD
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendNotifications=true`;

  makeAjaxCall('POST', url, accessToken, requestBody, (data) => {
=======
  makeAjaxCall('POST', `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendNotifications=true`, accessToken, requestBody, (data) => {
>>>>>>> Send event notifications to event attendees
    callback(data)
  })

}
