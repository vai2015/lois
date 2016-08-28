var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var confirmReturnCtrl = (function (_super) {
            __extends(confirmReturnCtrl, _super);
            function confirmReturnCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.showToolbar = true;
                this.loadFunc = app.api._return.getConfirmReturns;
                this.filter();
            }
            confirmReturnCtrl.prototype.process = function () {
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var ctrl = this;
                app.api._return.confirm(checkedEntities).then(function (result) {
                    ctrl.notify('success', 'Konfirmasi berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Konfirmasi gagal ' + error.data);
                });
            };
            confirmReturnCtrl.$inject = ['$scope', 'Notification'];
            return confirmReturnCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('confirmReturnCtrl', confirmReturnCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
