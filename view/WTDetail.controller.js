sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	return sap.ui.core.mvc.Controller.extend("BL_Monitoring.view.WTDetail", {

		onInit: function() {
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			if (sap.ui.Device.system.phone) {
				//Do not wait for the master2 when in mobile phone resolution  
				this.oInitialLoadFinishedDeferred.resolve();
			}
			this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function(oEvent) {
			var oParameters = oEvent.getParameters();
			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
				// When navigating in the Detail page, update the binding context  
				if (oParameters.name === "WTDetail") {
					var sEntityPath = "/" + oParameters.arguments.entity;
					this.bindView(sEntityPath);
				} else {
					return;
				}
			}, this));
		},

		handleResponsivePopoverPress: function(oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("BL_Monitoring.view.fragment.Popover", this);
				this.getView().addDependent(this._oPopover);
			}

			this._oPopover.openBy(oEvent.getSource());
		},

		bindView: function(sEntityPath) {
			var oView = this.getView();
			oView.bindElement(sEntityPath);
			//Check if the data is already on the client  
			if (!oView.getModel().getData(sEntityPath)) {
				// Check that the entity specified was found  
				var oData = oView.getModel().getData(sEntityPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				} else {
					this.fireDetailChanged(sEntityPath);
				}
			} else {
				this.fireDetailChanged(sEntityPath);
			}
		},
		showEmptyView: function() {
			this.getRouter().myNavToWithoutHash({
				currentView: this.getView(),
				targetViewName: "BL_Monitoring.view.NotFound",
				targetViewType: "XML"
			});
		},

		fireDetailChanged: function(sEntityPath) {
			this.getEventBus().publish("WTDetail", "Changed", {
				sEntityPath: sEntityPath
			});
		},

		fireDetailNotFound: function() {
			this.getEventBus().publish("WTDetail", "NotFound");
		},

		onNavBack: function() {
			this.getRouter().myNavBack("main");

		},

		/*
	onNavBack: function() {
		var oHistory = sap.ui.core.routing.History.getInstance(),
			sPreviousHash = oHistory.getPreviousHash(),
			oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		if (sPreviousHash !== undefined) {
			history.go(-1);
		} else {
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		}
	},
*/
		onDetailSelect: function(oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("WTDetail", {
				entity: oEvent.getSource().getBindingContext().getPath().slice(1)
			}, true);
		},

		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onExit: function(oEvent) {
			var oEventBus = this.getEventBus();
			oEventBus.unsubscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
			oEventBus.unsubscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
		}

	});
});