import React, { useEffect, useState } from "react";
import "./App.css";
import firebase from "./config/firebaseConfig";

const messaging = firebase.messaging();
messaging.usePublicVapidKey(
  "ัYour-Key"
);

const App = () => {
  const [tokenMess, setTokenMess] = useState("");

  useEffect(() => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Unable to get permission to notify.");
      }
    });
  });

  useEffect(() => {
    messaging.onMessage(payload => {
      console.log("Message received. ", payload);
    });
    navigator.serviceWorker.addEventListener("message", message =>
      console.log(message)
    );
  });

  const isTokenSentToServer = () => {
    return window.localStorage.getItem("sentToServer") === "1";
  };

  const setTokenSentToServer = sent => {
    window.localStorage.setItem("sentToServer", sent ? "1" : "0");
  };

  const sendTokenToServer = currentToken => {
    if (!isTokenSentToServer()) {
      console.log("Sending token to server...");
      setTokenSentToServer(true);
    } else {
      console.log(
        "Token already sent to server so won't send it again " +
          "unless it changes"
      );
    }
  };

  const messageBtn = () => {
    messaging
      .getToken()
      .then(currentToken => {
        if (currentToken) {
          sendTokenToServer(currentToken);
          console.log(currentToken);
          setTokenMess(currentToken);
          // updateUIForPushEnabled(currentToken);
        } else {
          // Show permission request.
          console.log(
            "No Instance ID token available. Request permission to generate one."
          );
          // updateUIForPushPermissionRequired();
          setTokenSentToServer(false);
        }
      })
      .catch(err => {
        console.log("An error occurred while retrieving token. ", err);
        // showToken("Error retrieving Instance ID token. ", err);
        setTokenSentToServer(false);
      });

    messaging.onTokenRefresh(() => {
      messaging
        .getToken()
        .then(refreshedToken => {
          console.log("Token refreshed.");
          // Indicate that the new Instance ID token has not yet been sent to the
          // app server.
          setTokenSentToServer(false);
          // Send Instance ID token to app server.
          sendTokenToServer(refreshedToken);
          console.log(refreshedToken);
          setTokenMess(refreshedToken);
          // ...
        })
        .catch(err => {
          console.log("Unable to retrieve refreshed token ", err);
        });
    });
  };

  return (
    <div className="App">
      <p>{tokenMess}</p>
      <button onClick={messageBtn}>btn</button>
    </div>
  );
};

export default App;
