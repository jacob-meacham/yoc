using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class Client : MonoBehaviour
{ 
    public void OnQuickPlay()
    {
        Debug.Log("Connecting");
        Socket socket = IO.Socket("http://127.0.0.1");
        socket.On(Socket.EVENT_CONNECT, () => {
            Debug.Log("Registering");
            socket.Emit("register", "");
            socket.On("registered", (evt) => {
                Debug.Log("Authenticating");
                socket.Emit("authenticate", JObject.Parse("{ token: '" + ((JObject)evt)["token"] + "' }"));
            });
        });
        socket.On("authenticated", (evt) => {
            Debug.Log("Joining Lobby");
            socket.Emit("lobby:join");
        });
        socket.On("lobby:joined", (evt) => {
            Debug.Log("Joined Lobby");
        });
        socket.On("lobby:matched", (evt) => {
            Debug.Log("matched");
            socket.Emit("lobby:acceptGame");
        });
        socket.On("lobby:accepted", (evt) => {
            Debug.Log("Accepted Game");
        });
        socket.On("lobby:partnerAccepted", (evt) => {
            Debug.Log("Partner accepted gamed");
        });
        socket.On("lobby:partnerLeft", () => {
            Debug.Log("Partner left game");
        });
        socket.On("game:starting", () => {
            Debug.Log("Game starting");
        });
        socket.On("game:started", () => {
            Debug.Log("Game started");
        });
        socket.On("game:state", (evt) => {
            Debug.Log(evt.ToString());
        });
        socket.On("unauthorized", () => {
            Debug.Log("Unauthorized");
        });
    }
}
