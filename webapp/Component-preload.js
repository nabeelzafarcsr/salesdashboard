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

			// Resolve the OData service URL based on where THIS component's
			// own resources were actually loaded from (UI5's resourceRoots),
			// rather than a hardcoded relative/absolute string in
			// manifest.json - stays correct across local BAS, Work Zone's
			// per-app subpath, and any iframe-origin differences.
			var sComponentBase = sap.ui.require.toUrl("com/csr/salesdashboardsalesdashboard").replace(/\/$/, "");
			var sServiceUrl = sComponentBase + "/sap/opu/odata/sap/ZPOSITIVE_REPORT_SRV/";
			var oAppEntry = this.getManifestEntry("sap.app");
			if (oAppEntry && oAppEntry.dataSources && oAppEntry.dataSources.mainService) {
				oAppEntry.dataSources.mainService.uri = sServiceUrl;
			}
			// eslint-disable-next-line no-console
			console.log("[Component] Resolved OData service URL:", sServiceUrl);

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
			var componentData = this.getComponentData && this.getComponentData();
			var params        = componentData && componentData.startupParameters;
			var dynaTraceURL  = params && params.dynaTraceURL && params.dynaTraceURL[0];
			if (dynaTraceURL) {
				// Async + explicit .fail() handling - a slow/unreachable/
				// CORS-blocked DynaTrace endpoint used to be able to throw a
				// synchronous, uncaught exception right here and take the
				// whole app down with it. Monitoring must always be
				// best-effort, never load-blocking.
				$.ajax({
					type: "GET",
					url: dynaTraceURL,
					async: true
				}).done(function(msg) {
					$("head").append(msg);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					// eslint-disable-next-line no-console
					console.warn("DynaTrace RUM script failed to load:", textStatus, errorThrown);
				});
			}
		}
		//End of changes by C5253525-dynatrace-API implementation
	});
});