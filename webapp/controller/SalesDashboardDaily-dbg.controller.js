sap.ui.define([
	"com/csr/salesdashboardsalesdashboard/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/csr/salesdashboardsalesdashboard/model/formatter"
], function(BaseController, JSONModel, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("com.csr.salesdashboardsalesdashboard.controller.SalesDashboardDaily", {
		formatter: formatter,
		onInit: function() {
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				totalRevenue: "0",
				totalMargin: "0",
				currency: "",
				totalCount: "0",
				isTableMode: true,
				isChartMode: false,
				tableBtnType: "Reject",
				chartBtnType: "Default",
				currDate: null,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemsTitle")
			});
			this.getRouter().getRoute("calViewDay").attachPatternMatched(this._onCalendarViewMatched, this);
			this.setModel(oViewModel, "calViewDay");

		},

		_onCalendarViewMatched: function(oEvent) {
			var oViewModel = this.getModel("calViewDay");
			var sTitle = this.getResourceBundle().getText("invoices");
			oViewModel.setProperty("/detailLineItemsTitle", sTitle);
			var sModel = this.getView().getModel("utilityDataModel");
			var sDate = sModel.getData();
			if (sDate.selectedDate) {
				var oDate = new Date(sDate.selectedDate);
				var formattedDate = formatter.dateFormatting(oDate);
				oViewModel.setProperty("/currDate", formattedDate);
				var utcDate = new Date();
				utcDate.setUTCFullYear(oDate.getFullYear());
				utcDate.setUTCMonth(oDate.getMonth());
				utcDate.setUTCDate(oDate.getDate());
				utcDate.setUTCHours(23, 59, 59, 59);
				this.getSaleDayReportCall(utcDate);
				this.getSaleDayReportChart(utcDate);
			}

		},

		getSaleDayReportCall: function(sStartDate) {
			//table finding
			var oItemsList = this.getView().byId("lineItemsList");
			var oTemplate = oItemsList.getBindingInfo("items").template;
			var oFilter = new Filter("StartDate", FilterOperator.EQ, sStartDate);
			oItemsList.bindItems({
				path: "/ReportDateSet",
				template: oTemplate,
				filters: [oFilter]
			});
		},

		getSaleDayReportChart: function(sStartDate) {
			var oViewModel = this.getModel("calViewDay");
			oViewModel.setProperty("/busy",true);
			var oFilters = [];
			var filter1 = new Filter("StartDate", FilterOperator.EQ, sStartDate);
			oFilters.push(filter1);
			var sPath = "/ReportDateSet";
			var self = this;
			this.getModel().read(sPath, {
				filters: oFilters,
				success: function(data) {
					oViewModel.setProperty("/busy",false);
					if (data.results.length > 0) {
						var chartModel = new sap.ui.model.json.JSONModel();
						chartModel.setData(data.results);
						var oVizFrame = self.getView().byId("idISVizFrame");
						oVizFrame.setModel(chartModel);
					}
				},
				error: function(err) {
					oViewModel.setProperty("/busy",false);
				}
			});
		},

		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("calViewDay");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				this.countHeaderData(this.byId("lineItemsList"));
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("invoicesCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("invoices");
				}
				oViewModel.setProperty("/detailLineItemsTitle", sTitle);
			}

		},

		countHeaderData: function(sTable) {
			var sItems = sTable.getItems();
			var sItemContextPath = sItems[0].getBindingContextPath();
			var sItem = this.getModel().getProperty(sItemContextPath);
			if (sItem) {
				var oLocalModel = this.getView().getModel("calViewDay");
				var revenue = this.formatter.formatNumericValues(sItem.TotalRevenuevalue);
				var totalCount = this.formatter.formatCount(sItem.TotalCountvalue);
				oLocalModel.setProperty("/totalRevenue", revenue);
				oLocalModel.setProperty("/totalMargin", sItem.TotalMarginvalue);
				oLocalModel.setProperty("/currency", sItem.Waerk);
				oLocalModel.setProperty("/totalCount", totalCount);
			}
			
			// var sItems = sTable.getItems();
			// var sRevenue = 0;
			// var currency;
			// var sMargin = 0;
			// for (var index = 0; index < sItems.length; index++) {
			// 	var sItemContextPath = sItems[index].getBindingContextPath();
			// 	var oItem = this.getModel().getProperty(sItemContextPath);
			// 	currency = oItem.Waerk;
			// 	if(typeof oItem.Revenue === 'string'){
			// 		var revn = oItem.Revenue.replace(/\s+/g, '');
			// 		sRevenue = parseFloat((parseFloat(sRevenue)).toFixed(2)) + parseFloat((parseFloat(revn)).toFixed(2));
			// 	}
			// 	if(typeof oItem.Margin === 'string'){
			// 		var mar = oItem.Margin.replace(/\s+/g, '');
			// 		sMargin = parseFloat((parseFloat(sMargin)).toFixed(2)) + parseFloat((parseFloat(mar)).toFixed(2));
			// 	}
			// }
			// var oLocalModel = this.getView().getModel("calViewDay");
			// oLocalModel.setProperty("/totalRevenue", parseFloat(parseFloat(sRevenue)).toFixed(2));
			// oLocalModel.setProperty("/totalMargin", parseFloat(parseFloat(sMargin)).toFixed(2));
			// oLocalModel.setProperty("/currency", currency);
			// oLocalModel.setProperty("/totalCount", sItems.length.toString());
		},

		handleTableView: function(oEvent) {
			var oLocalModel = this.getView().getModel("calViewDay");
			oLocalModel.setProperty("/isTableMode", true);
			oLocalModel.setProperty("/isChartMode", false);
			oLocalModel.setProperty("/tableBtnType", "Reject");
			oLocalModel.setProperty("/chartBtnType", "Default");
		},

		handleChart: function(oEvent) {
			var oLocalModel = this.getView().getModel("calViewDay");
			oLocalModel.setProperty("/isTableMode", false);
			oLocalModel.setProperty("/isChartMode", true);
			oLocalModel.setProperty("/tableBtnType", "Default");
			oLocalModel.setProperty("/chartBtnType", "Reject");
		},
		handleBack: function() {
			this.getRouter().navTo("calViewMW", {}, true);
		}

	});
});