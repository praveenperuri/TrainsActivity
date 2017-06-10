//JS-JQuery Code goes here
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAGhR-vCk3_e0UHJAAtalxeJlKU9UdKDI4",
    authDomain: "test-project-45313.firebaseapp.com",
    databaseURL: "https://test-project-45313.firebaseio.com",
    projectId: "test-project-45313",
    storageBucket: "test-project-45313.appspot.com",
    messagingSenderId: "458289860216"
};
firebase.initializeApp(config);

var database = firebase.database();


function calcNextArrival(first, freq) {
    var currentTime = new Date();
    var nextArrivalTime = first;
    while (nextArrivalTime < currentTime) {
        nextArrivalTime = new Date(nextArrivalTime.getTime() + parseInt(freq) * 60000);
    }
    var difference = nextArrivalTime.getTime() - currentTime.getTime(); // This will give difference in milliseconds
    var resultInMinutes = Math.round(difference / 60000);
    return {
        "nextArrivalTime": nextArrivalTime,
        "minutesAway": resultInMinutes
    }
}

function formatDate(date) {
    var d = new Date(date);
    var hh = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var dd = "AM";
    var h = hh;
    if (h >= 12) {
        h = hh - 12;
        dd = "PM";
    }
    if (h == 0) {
        h = 12;
    }
    m = m < 10 ? "0" + m : m;

    s = s < 10 ? "0" + s : s;

    /* if you want 2 digit hours:
    h = h<10?"0"+h:h; */

    var pattern = new RegExp("0?" + hh + ":" + m + ":" + s);

    var replacement = h + ":" + m;
    /* if you want to add seconds
    replacement += ":"+s;  */
    replacement += " " + dd;

    return replacement;
    //return date.replace(pattern, replacement);
}



$("button[type='submit']").on("click", function(event) {
    event.preventDefault();
    // Setting the input value to a variable and then clearing the input
    var tname = $("#name-input").val().trim();
    var tdest = $("#dest-input").val().trim();
    var tfirst = $("#first-time-input").val().trim();
    var tfreq = $("#freq-input").val().trim();

    var trainObj = {
        "name": tname,
        "destination": tdest,
        "firstArrival": tfirst,
        "frequency": tfreq
    };

    var regEx = /^([2][0-3]|[01]?[0-9])([.:][0-5][0-9])?$/;
    var found = tfirst.match(regEx);
    if (found) {
        console.log(tfirst);

        var timeArray = tfirst.split(':');
        var firstArrivalTime = new Date();
        firstArrivalTime.setHours(parseInt(timeArray[0]), parseInt(timeArray[1]), 0);

        var nextArrival = calcNextArrival(firstArrivalTime, tfreq);

        var html = "<tr><td>" + tname + "</td><td>" + tdest + "</td><td>" + tfreq + "</td><td>" + formatDate(nextArrival.nextArrivalTime) + "</td><td>" + nextArrival.minutesAway + "</td></tr>";

        //Try to get tbody first with jquery children. works faster!
        var tbody = $('#tblTrains').children('tbody');

        //Then if no tbody just select your table 
        var table = tbody.length ? tbody : $('#tblTrains');

        //Add row
        table.append(html);

        $("#name-input").val('');
        $("#dest-input").val('');
        $("#first-time-input").val('');
        $("#freq-input").val('');

        database.ref().push(trainObj);

        alert('Train information was saved successfully!')

    } else {
        alert('Invalid time entry !! Enter first arrival time as hh:mm or hh.mm (24 hr)');
    }

});

//render on load

database.ref().once("value", function(snapshot) {
        console.log(snapshot.val());
        snapshot.forEach(function(childSnapshot) {
            console.log(childSnapshot.val());
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();


            var trainObj = {
                "name": childSnapshot.val().name,
                "destination": childSnapshot.val().destination,
                "firstArrival": childSnapshot.val().firstArrival,
                "frequency": childSnapshot.val().frequency
            };

            var timeArray = trainObj.firstArrival.split(':');
            var firstArrivalTime = new Date();
            firstArrivalTime.setHours(parseInt(timeArray[0]), parseInt(timeArray[1]), 0);

            var nextArrival = calcNextArrival(firstArrivalTime, trainObj.frequency);

            var html = "<tr><td>" + trainObj.name + "</td><td>" + trainObj.destination + "</td><td>" + trainObj.frequency + "</td><td>" + formatDate(nextArrival.nextArrivalTime) + "</td><td>" + nextArrival.minutesAway + "</td></tr>";

            //Try to get tbody first with jquery children. works faster!
            var tbody = $('#tblTrains').children('tbody');

            //Then if no tbody just select your table 
            var table = tbody.length ? tbody : $('#tblTrains');

            //Add row
            table.append(html);


        });

    },
    function(errorObject) {
        console.log("Error while reading the database: " + errorObject.code);

    });
