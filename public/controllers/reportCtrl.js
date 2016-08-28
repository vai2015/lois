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
                this.loadFunc = app.api.report.getRecapitulations;
                this.init();
            }
            reportCtrl.prototype.init = function () {
                var ctrl = this;
                app.api.user.getSession().then(function (result) {
                    ctrl.reports = result.data['reports'];
                    ctrl.activeReport = ctrl.reports[0].name;
                });
            };
            reportCtrl.prototype.onReportChange = function (report) {
                this.activeReport = report;
                switch (report) {
                    case 'Belum Terbayar':
                        break;
                    case 'Terbayar':
                        break;
                    case 'Rekapitulasi':
                        this.loadFunc = app.api.report.getRecapitulations;
                        this.dataFunc = app.api.report.getRecapitulationsReport;
                        this.renderFunc = app.api.reportPrint.printRecapitulation;
                        break;
                    case 'Pengiriman':
                        this.loadFunc = app.api.report.getDeliveries;
                        break;
                    case 'Retur':
                        this.loadFunc = app.api.report.getReturn;
                        break;
                    case 'SJ Belum Kembali':
                        this.loadFunc = app.api.report.getUnconfirmed;
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
