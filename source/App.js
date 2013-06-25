enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	components:[
        {kind: "directed.SmartStartAPI", name: "api",
            onLoggedIn: "handleLoggedIn", onLogInError: "handleLogInError",
            onVehiclesReslt: "handleVehicleResult", onVehiclesError: "handleVehiclesError",
            onCommandResult: "handleCommandResult", onCommandError: "handleCommandError"
        },
        
		{kind: "onyx.Toolbar", content: "SmartStart"},
		{kind: "enyo.Scroller", name: "logInScroller", fit: true, components: [
            {kind: "FittableColumns", components: [
                {kind: "onyx.InputDecorator", components: [
                    {kind: "onyx.Input", name: "username", placeholder: "Username", onchange: "inputChange"}
                ]}
            ]},
            {kind: "FittableColumns", components: [
                {kind: "onyx.InputDecorator", components: [
                    {kind: "onyx.Input", name: "password", placeholder: "Password", onchange: "inputChange"}
                ]}
            ]},
            {kind: "FittableColumns", components: [
                {kind: "onyx.Button", content: "Log In", ontap: "logIn"}
            ]}
		]},
		{kind: "enyo.Scroller", name: "commandScroller", fit: true, components: [
            
		]},
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content: "Vehicles", ontap: "selectVehicles"}
		]}
	],
    
    sessionId: "",
    vehicles: [],
    
    constructor: function() {
        this.inherited(arguments);
    },
    create: function() {
        this.inherited(arguments);
        
        if (enyo.platform.webos) {
			PalmSystem.stageReady();
		}
    },
    
    // Instigate the API
    inputChange: function(inSender, inEvent) {
    
    },
    
    logIn: function(inSender, inEvent) {
    
    },
    
	selectVehicles: function(inSender, inEvent) {
		
	},
    
    // Handle API results
    handleLoggedIn: function(sessionData) {
        if (sessionData) {
            this.sessionId = sessionData.sessionId;
        }
    },
    handleLogInError: function(error) {
    },
    handleVehicleResult: function(vehicles, inSender, inResponse) {
        this.vehicles = vehicles;
    },
    handleVehiclesError: function(error) {
    },
    handleCommandResult: function(inSender, inResponse) {
    },
    handleCommandError: function(error) {
    },
    
    // Send commands
});
