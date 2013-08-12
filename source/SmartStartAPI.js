enyo.kind({
	name: "directed.SmartStartAPI",
	kind: "enyo.Control",
	components:[
		
	],
    
    events: {
        onLoggedIn: "",
        onLogInError: "",
        onVehiclesResult: "",
        onVehiclesError: "",
        onCommandResult: "",
        onCommandError: ""
    },
    
    host: "colt.calamp-ts.com",
    username: "",
    password: "",
    sessionId: "",
    
    devices: [],
    
    /**
     * Force reset of session ID and log in.
     */
    logIn: function(username, password) {
        this.username = username;
        this.password = password;
        
        this.getSessionId();
    },
    
    /**
     * Get session ID with given credentials.
     */
    getSessionId: function() {
        var loginUrl = "https://" + this.host + "/auth/login/" + this.username + "/" + this.password;
        
        var request = new enyo.Ajax({
            url: loginUrl,
            handleAs: "json",
            contentType: "text/plain"
        });

        request.response(enyo.bind(this, "processLogin"));
		request.error(enyo.bind(this, "processLoginError"));
        request.go();
    },
    
    /**
     * Set session ID from previously stored session.
     */
    setSessionId: function(newSessionId) {
        this.sessionId = newSessionId;
    },
    
    processLogin: function(inSender, inResponse) {
        /*if (!inSender || !inSender.xhrResponse) {
            this.doLogInError({"errorCode": , "errorText": "Invalid response"});
            return;
        }*/
        if (!inResponse || !inResponse.Return.Results) {
            this.sessionId = "";
            this.doLogInError({"errorCode": "", "errorText": "Invalid response"});
            return;
        }
        
        /*var headers = inSender.xhrResponse.headers;
        var setCookie = headers["set-cookie"];
        
        if (setCookie) {
            var exp = new RegExp("^kohanasession=(.*?);", "m");
            
            // TODO: Just read inResponse.Results.SessionID
            this.sessionId = exp.exec(setCookie);
        }*/
        
        var sessionID = inResponse.Return.Results.SessionID;
        if (sessionID) {
            this.sessionId = sessionID;
            this.doLoggedIn({"sessionId": this.sessionId});
        } else {
            // We need to error out here!
            this.sessionId = "";
            this.doCommandError({"errorCode": "", "errorText": "No session ID"});
        }
    },
	processLoginError: function(inSender, inResponse) {
		this.sessionId = "";
		this.doLogInError({"errorCode": "", "errorText": "Invalid response"});
	},
    
    getVehicles: function() {
        if (!this.sessionId || this.sessionId == "") {
            this.doVehiclesError({"errorCode": "", "errorText": "No session ID"});
            return;
        }
        
        var vehiclesUrl = "https://" + this.host + "/device/advancedsearch?sessid=" + this.sessionId;
        var request = new enyo.Ajax({
            url: vehiclesUrl,
            handleAs: "json",
            contentType: "text/plain"
        });

        request.response(enyo.bind(this, "processVehicles"));
        request.error(enyo.bind(this, "processVehiclesError"));
        request.go();
    },
    
    processVehicles: function(inSender, inResponse) {
        if (!inResponse || !inResponse.Return || !inResponse.Return.Results || !inResponse.Return.Results.Devices) {
            this.doVehiclesError({"errorCode": "", "errorText": "Invalid response"});
            return;
        }
        
        this.devices = inResponse.Return.Results.Devices;
        
        // Return results:
        // deviceId (DeviceId)
        // name (Name)
        // description (Description)
        // vin (Field1)
        // modelYear (Field4)
        // make (Filed5)
        // model (field6)
        // airId (AirId)
        // commands (AvailActions)
        //     Name
        //     Description
        var map = [
                {"from": "DeviceId", "to": "deviceId"},
                {"from": "Name", "to": "name"},
                {"from": "Description", "to": "description"},
                {"from": "Field1", "to": "vin"},
                {"from": "Field5", "to": "make"},
                {"from": "Field6", "to": "model"},
                {"from": "AirId", "to": "airId"}
            ];
        var vehicles = [];
        for (var i = 0; i < this.devices.length; i++) {
			vehicles[i] = {};
            for (var j = 0; j < map.length; j++) {
                vehicles[i][map[j].to] = this.devices[i][map[j].from];
            }
            /*vehicles[i].commands = [];
            for (var k = 0; k < this.devices[i].AvailActions; k++) {
                vehicles[i].commands[k] = this.devices[i].AvailActions[k];
            }*/
            vehicles[i].commands = this.devices[i].AvailActions;
        }
        
		var event = {};
		event.vehicles = vehicles;
        this.doVehiclesResult(event, inSender, inResponse);
    },
	processVehiclesError: function(inSender, inResponse) {
		this.doVehiclesError({"errorCode": "", "errorText": "Invalid response"});
	},
    
    sendCommand: function(vehicleId, command) {
        if (!this.sessionId || this.sessionId == "") {
            this.doCommandError({"errorCode": "", "errorText": "No session ID"});
            return;
        }
        if (!vehicleId || !command) {
            this.doCommandError({"errorCode": "", "errorText": "Invalid argument"});
            return;
        }
        
        var commandUrl = "https://" + this.host + "/device/sendcommand/" + vehicleId + "/" + command + "?sessid=" + this.sessionId;
        var request = new enyo.Ajax({
            url: commandUrl,
            handleAs: "json",
            contentType: "text/plain"
        });

        request.response(enyo.bind(this, "processCommandResult"));
        request.error(enyo.bind(this, "processCommandError"));
        request.go();
    },
    
    processCommandResult: function(inSender, inResponse) {
        if (!inResponse) {
            this.doCommandError({"errorCode": "", "errorText": "Invalid response"});
            return;
        }
        this.doCommandResult(inSender, inResponse);
    },
    processCommandError: function(inSender, inResponse) {
		this.doCommandError({"errorCode": "", "errorText": "Invalid response"});
	}
	
});
