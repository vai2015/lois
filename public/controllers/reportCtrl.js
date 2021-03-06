var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var reportCtrl = (function (_super) {
            __extends(reportCtrl, _super);
            function reportCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.showToolbar = true;
                this.init();
            }
            reportCtrl.prototype.init = function () {
                var ctrl = this;
                app.api.user.getSession().then(function (result) {
                    var roleReports = result.data['reports'];
                    ctrl.reports = roleReports.map(function (e) { return e.report; });
                });
            };
            reportCtrl.prototype.onReportChange = function (report) {
                this.activeReport = report;
                switch (report) {
                    case 'Belum Terbayar':
                        this.loadFunc = app.api.report.getUnpaid;
                        this.dataFunc = app.api.report.getUnpaidReport;
                        this.renderFunc = app.api.reportPrint.printUnpaid;
                        break;
                    case 'Terbayar':
                        this.loadFunc = app.api.report.getPaid;
                        this.dataFunc = app.api.report.getPaidReport;
                        this.renderFunc = app.api.reportPrint.printPaid;
                        break;
                    case 'Rekapitulasi':
                        this.loadFunc = app.api.report.getRecapitulations;
                        this.dataFunc = app.api.report.getRecapitulationsReport;
                        this.renderFunc = app.api.reportPrint.printRecapitulation;
                        break;
                    case 'Pengiriman':
                        this.loadFunc = app.api.report.getDeliveries;
                        this.dataFunc = app.api.report.getDeliveriesReport;
                        this.renderFunc = app.api.reportPrint.printDelivery;
                        break;
                    case 'Retur':
                        this.loadFunc = app.api.report.getReturn;
                        this.dataFunc = app.api.report.getReturnReport;
                        this.renderFunc = app.api.reportPrint.printReturn;
                        break;
                    case 'SJ Belum Kembali':
                        this.loadFunc = app.api.report.getUnconfirmed;
                        this.dataFunc = app.api.report.getUnconfirmedReport;
                        this.renderFunc = app.api.reportPrint.printUnconfirmed;
                        break;
                    case 'Daftar Kiriman':
                        this.loadFunc = app.api.report.getDeliveryList;
                        this.dataFunc = app.api.report.getDeliveryListReport;
                        this.renderFunc = app.api.reportPrint.printDeliveryList;
                        break;
                    case 'Komisi':
                        this.loadFunc = app.api.report.getCommisions;
                        this.dataFunc = app.api.report.getCommisionsReport;
                        this.renderFunc = app.api.reportPrint.printCommision;
                        break;
                }
                this.filters = {};
                this.paging.page = 1;
                this.filter();
            };
            reportCtrl.prototype.print = function () {
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada data yang pilih');
                    return;
                }
                var ctrl = this;
                ctrl.loadingData = true;
                ctrl.dataFunc(checkedEntities).then(function (result) {
                    ctrl.renderFunc(result.data).then(function (buffer) {
                        var blob = new Blob([buffer.data], { type: 'application/pdf' });
                        var url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    });
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            reportCtrl.$inject = ['$scope', 'Notification'];
            return reportCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('reportCtrl', reportCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
