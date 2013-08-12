var appPrefs = {
		sessionId: "",
		vehicles: "",
		username: "",
		password: ""
	};

kAppView = {
		login: "login",
		command: "command",
		loading: "loading"
	};

enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	components:[
		{kind: "directed.SmartStartAPI", name: "api",
			onLoggedIn: "handleLoggedIn", onLogInError: "handleLogInError",
			onVehiclesResult: "handleVehicleResult", onVehiclesError: "handleVehiclesError",
			onCommandResult: "handleCommandResult", onCommandError: "handleCommandError"
		},
        
		{kind: "onyx.Toolbar", classes: "header", content: "SmartStart"},
		{kind: "enyo.Scroller", name: "loginScroller", fit: true, classes: "login-items", showing: false, components: [
			{kind: "FittableColumns", classes: "column", components: [
				{kind: "onyx.InputDecorator", components: [
					{kind: "onyx.Input", name: "username", placeholder: "Username", onchange: "inputChange"}
				]}
			]},
			{kind: "FittableColumns", classes: "column", components: [
				{kind: "onyx.InputDecorator", components: [
					{kind: "onyx.Input", name: "password", type: "password", placeholder: "Password", onchange: "inputChange"}
				]}
			]},
			{kind: "FittableColumns", classes: "column", components: [
				{kind: "onyx.Button", content: "Log In", ontap: "logIn"}
			]}
		]},
		{kind: "enyo.Scroller", name: "commandScroller", fit: true, showing: false, components: [
			
		]},
		{kind: "enyo.Scroller", name: "loadingScroller", fit: true, showing: false, components: [
			
		]},
		{kind: "onyx.Toolbar", components: [
			{},
			{kind: "onyx.Button", name: "vehicles", showing: false, content: "Vehicles", ontap: "selectVehicles"}
		]}
	],
    
	vehicles: [],
	currVehicle: 0,
    
	constructor: function() {
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
        
		if (enyo.platform.webos) {
			PalmSystem.stageReady();
		}
        
		this.loadAppPrefs();
		
		if (!this.hasCredentials()) {
			this.instigateLogin();
		} else {
			if (this.vehicles && this.vehicles.length)
				this.buildCommands();
			else
				this.$.api.getVehicles();
		}
	},

	toggleView: function(view) {
		// TODO: It might be appropriate to just use a class.
		// Can set multiple, uncontained objects to visible or invisible at once.
		switch (view) {
			case kAppView.login:
				this.$.loginScroller.show();
				this.$.commandScroller.hide();
				this.$.vehicles.hide();
				this.$.loadingScroller.hide();
				break;
			case kAppView.command:
				this.$.loginScroller.hide();
				this.$.commandScroller.show();
				this.$.vehicles.show();
				this.$.loadingScroller.hide();
				break;
			case kAppView.loading:
				this.$.loginScroller.hide();
				this.$.commandScroller.hide();
				this.$.vehicles.hide();
				this.$.loadingScroller.show();
				break;
			default:
				break;
		}
	},
	exists: function(item) {
		var exists = false;
		
		if (item !== undefined || item !== null) {
			switch (typeof(item)) {
				case "string":
					exists = (item.length > 0);
					break;
				case "Object":
					exists = true;
					break;
				default:
					break;
			}
		}
		
		return exists;
	},

	loadAppPrefs: function() {
		if (window.localStorage.appPrefs)
            appPrefs = enyo.json.parse(window.localStorage.appPrefs);

		if (this.exists(appPrefs.vehicles)) {
			this.vehicles = enyo.json.parse(appPrefs.vehicles);
		}
        /*if (!this.params.sublaunch) {
            if (appPrefs.autoloadWidget === true) {
                this.launchWidget();
            }
            if (appPrefs.closeOnLoad === true) {
                window.close();
            }
        }*/
	},
	setAppPrefs: function(sender) {
		//console.log("Setting value");
		//console.log(enyo.json.stringify(appPrefs));
        
		if (this.vehicles && this.vehicles.length) {
			appPrefs.vehicles = enyo.json.stringify(this.vehicles);
		}
		
		//console.log(enyo.json.stringify(appPrefs));
	},
	saveAppPrefs: function(sender) {
		//console.log("Save app prefs...");
		//console.log(enyo.json.stringify(appPrefs));

		window.localStorage.appPrefs = enyo.json.stringify(appPrefs);
	},

	hasCredentials: function() {
		var hasSessionId = this.exists(appPrefs.sessionId);
		
		if (hasSessionId) {
			this.$.api.setSessionId(appPrefs.sessionId);
		}
		
		return hasSessionId;
	},
    
	instigateLogin: function() {
		if (this.exists(appPrefs.username) && this.exists(appPrefs.password)) {
			this.$.api.logIn(appPrefs.username, appPrefs.password);
		} else {
			this.toggleView(kAppView.login);
		}
	},
	
	buildCommands: function() {
		// TODO: Don't build this dynamically. Have a static one that gets supported items turned on.
		var commandToKind = {
				"arm":		{kind: "ArmButton",		action: "armTap"},
				"disarm":	{kind: "DisarmButton",	action: "disarmTap"},
				"trunk":	{kind: "TrunkButton",	action: "trunkTap"},
				"panic":	{kind: "PanicButton",	action: "panicTap"},
				"locate":	{kind: "LocateButton",	action: "locateTap"},
			};
		if (this.vehicles.length && this.vehicles[this.currVehicle].commands.length) {
			for (var i = 0; i < this.vehicles[this.currVehicle].commands.length; i++) {
				var command = this.vehicles[this.currVehicle].commands[i];
				
				if (commandToKind[command.Name] !== undefined) {
					this.$.commandScroller.createComponent({
						kind: commandToKind[command.Name].kind,
						content: command.Description,
						ontap: commandToKind[command.Name].action
					}, {owner: this});
				}
			}
			
			this.toggleView(kAppView.command);
		}
	},
    destroyCommands: function() {
	
	},
	
	// Instigate the API
	inputChange: function(inSender, inEvent) {
		
	},

	logIn: function(inSender, inEvent) {
		var username = this.$.username.getValue();
		var password = this.$.password.getValue();
		
		this.$.api.logIn(username, password);
	},

	selectVehicles: function(inSender, inEvent) {
		// this.currVehicle = ;
		// this.destroyCommands();
		// this.buildCommands();
	},
    
	// Handle API results
	handleLoggedIn: function(sessionData) {
		if (sessionData) {
			appPrefs.sessionId = sessionData.sessionId;
			appPrefs.username = this.$.username.getValue();
			appPrefs.password = this.$.password.getValue();
			this.saveAppPrefs();
            
			this.$.api.getVehicles();
		}
		// error
	},
	handleLogInError: function(error) {
		if (this.exists(appPrefs.username) && this.exists(appPrefs.password)) {
			appPrefs.username = "";
			appPrefs.password = "";
			this.saveAppPrefs();
		}
		
		// error
	},
	handleVehicleResult: function(inSender, inEvent) {
		this.vehicles = inEvent.vehicles;
		
		appPrefs.vehicles = enyo.json.stringify(inEvent.vehicles);
		this.setAppPrefs();
		this.saveAppPrefs();
		
		this.buildCommands();
		
		//this.log("VEHICLES " + enyo.json.stringify(inEvent.vehicles));
	},
	handleVehiclesError: function(inSender, inEvent) {
		// error
		this.instigateLogin();
	},
	handleCommandResult: function(inSender, inEvent) {
		
	},
	handleCommandError: function(inSender, inEvent) {
		
	},
    
    // Send commands
	armTap: function(inSender, inEvent) {
		this.$.api.sendCommand(this.vehicles[this.currVehicle].deviceId,"arm");
	},
	disarmTap: function(inSender, inEvent) {
		this.$.api.sendCommand(this.vehicles[this.currVehicle].deviceId,"disarm");
	},
	trunkTap: function(inSender, inEvent) {
		this.$.api.sendCommand(this.vehicles[this.currVehicle].deviceId,"trunk");
	},
	panicTap: function(inSender, inEvent) {
		this.$.api.sendCommand(this.vehicles[this.currVehicle].deviceId,"panic");
	},
	locateTap: function(inSender, inEvent) {
		this.$.api.sendCommand(this.vehicles[this.currVehicle].deviceId,"locate");
	},
});
