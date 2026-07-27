sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/csr/salesdashboardsalesdashboard/model/models",
	"com/csr/salesdashboardsalesdashboard/controller/ErrorHandler"
], function(UIComponent, Device, models, ErrorHandler) {
	"use strict";

	return UIComponent.extend("com.csr.salesdashboardsalesdashboard.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			this._oErrorHandler = new ErrorHandler(this);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createUtilityModel(), "utilityDataModel");
			UIComponent.prototype.init.apply(this, arguments);
			//this.getModel().setDefaultBindingMode("TwoWay");
			// create the views based on the url/hash
			this.getRouter().initialize();
			//Start of changes by C5253525-dynatrace-API implementation			
			this.loadDynaTraceApi();
			//End of changes by C5253525-dynatrace-API implementation

		},
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		//Start of changes by C5253525-dynatrace-API implementation
		loadDynaTraceApi: function() {
			//Start of changes by I561959 - Fix for UI upgrade
			var componentData = this.getComponentData && this.getComponentData();
			var params        = componentData && componentData.startupParameters;
			var dynaTraceURL  = params && params.dynaTraceURL && params.dynaTraceURL[0];
			if (dynaTraceURL) {
			//End of changes by I561959 - Fix for UI upgrade
				var msg = $.ajax({
					type: "GET",
					url: dynaTraceURL, //"https://qtc56166.live.dynatrace.com/api/v1/rum/jsTag/APPLICATION-6DB6D4D1582D53F5?Api-Token=JwoP8TmlToyfvHSjOs11k",
					async: false
				}).responseText;
				$("head").append(msg);
			}
		}
		//End of changes by C5253525-dynatrace-API implementation
	});
});