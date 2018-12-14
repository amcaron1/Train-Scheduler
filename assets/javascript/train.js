$(document).ready(function() {

    // Initializes Firebase
    var config = {
        apiKey: "AIzaSyCc0mNYzRL2lr7EcFyDSc6u33APnTU0GUo",
        authDomain: "caron-trains.firebaseapp.com",
        databaseURL: "https://caron-trains.firebaseio.com",
        projectId: "caron-trains",
        storageBucket: "caron-trains.appspot.com",
        messagingSenderId: "965387491614"
    };
    firebase.initializeApp(config);

    var dataRef = firebase.database();

    // Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
    dataRef.ref().on("child_added", function(childSnapshot) {

        // Logs everything that's coming out of childSnapshot
        console.log(childSnapshot.val().trainName);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().firstTrainTime);
        console.log(childSnapshot.val().frequency);

        // Calls function to calculate when the next train arrives
        var minutesTillNextArrivalTemp = calcMinutesTillTrain(childSnapshot.val().firstTrainTime, childSnapshot.val().frequency);
        // Adds minutesTillNextTrain to current time in order to find when next train will arrive
        var nextArrivalTemp = moment().add(minutesTillNextArrivalTemp, "minutes").format("hh:mm A");

        // The rest of the function creates a new row in the table to display the train info
        var traintr = $("<tr>");

        var trainName = $("<td>").html(childSnapshot.val().trainName);
        var destination = $("<td>").html(childSnapshot.val().destination);
        var frequency = $("<td>").html(childSnapshot.val().frequency);
        var nextArrival = $("<td>").html(nextArrivalTemp);
        var minutesTillNextArrival = $("<td>").html(minutesTillNextArrivalTemp);

        traintr.append(trainName);
        traintr.append(destination);
        traintr.append(frequency);
        traintr.append(nextArrival);
        traintr.append(minutesTillNextArrival);

        $("#display-trains").append(traintr);

        // Handles the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    // Calculates the number of minutes until the next train comes
    function calcMinutesTillTrain(firstTrainTimeL,frequencyL) {
        // Handles the case where current time is before the first train time
        var firstTrainTimeConverted = moment(firstTrainTimeL, "HH:mm").subtract(1, "years");
        var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");
        var remainder = diffTime % frequencyL;
        var minutesTillTrain = frequencyL - remainder;
        return(minutesTillTrain);
    };

    // Captures add-train button click
    $("#add-train").on("click", function(event) {
        event.preventDefault();

        // Pulls input data from the DOM
        var trainName = $("#train-name").val().trim();
        var destination = $("#destinationH").val().trim();
        var firstTrainHours = $("#first-train-hours").val().trim();
        var firstTrainMinutes = $("#first-train-minutes").val().trim();
        var frequency = $("#frequencyH").val().trim();
        
        // Checks that the input fields are not blank
        if (trainName != "" && destination != "" && firstTrainHours != "" && firstTrainMinutes != "" && frequency !="") {
            // Checks that the first train hours and minutes are military time
            if (firstTrainHours >= 0 && firstTrainHours <= 23 && firstTrainMinutes >= 0 && firstTrainMinutes <= 59) {
                // Creates firstTrainTime from hours and minutes
                var firstTrainTime = firstTrainHours + ":" + firstTrainMinutes;
                // Clears input form
                $("#train-name").val("");
                $("#destinationH").val("");
                $("#first-train-hours").val("");
                $("#first-train-minutes").val("");
                $("#frequencyH").val("");

                // Pushes the data to the database
                dataRef.ref().push({

                    trainName: trainName,
                    destination: destination,
                    firstTrainTime: firstTrainTime,
                    frequency: frequency,
                    dateAdded: firebase.database.ServerValue.TIMESTAMP
                });
            }
            else {
                alert("Hours must be 0-23 and minutes 0-59");
            }
        }
        else {
            alert("All fields must be completed with valid data");
        }
    });

})
