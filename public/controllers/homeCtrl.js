var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var homeCtrl = (function (_super) {
            __extends(homeCtrl, _super);
            function homeCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.loadOverall();
                this.onSummaryChanges('destination');
            }
            homeCtrl.prototype.loadOverall = function () {
                var ctrl = this;
                app.api.home.getOverall(ctrl.query).then(function (result) {
                    ctrl.overall = result.data;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            homeCtrl.prototype.onSummaryChanges = function (summary) {
                switch (summary) {
                    case 'destination':
                        this.loadFunc = app.api.home.getDestinations;
                        break;
                    case 'sender':
                        this.loadFunc = app.api.home.getSenders;
                        break;
                    case 'paymentType':
                        this.loadFunc = app.api.home.getPaymentTypes;
                        break;
                    case 'paymentStatus':
                        this.loadFunc = app.api.home.getPaymentStatuses;
                        break;
                    case 'region':
                        this.loadFunc = app.api.home.getRegions;
                        break;
                }
                this.loadOverall();
                this.filter();
            };
            homeCtrl.$inject = ['$scope', 'Notification'];
            return homeCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('homeCtrl', homeCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
