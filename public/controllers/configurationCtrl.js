var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var configurationCtrl = (function (_super) {
            __extends(configurationCtrl, _super);
            function configurationCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.loadFunc = app.api.configuration.getAll;
                this.getFunc = app.api.configuration.get;
                this.saveFunc = app.api.configuration.save;
                this.deleteFunc = app.api.configuration.delete;
                this.showToolbar = true;
            }
            configurationCtrl.prototype.onConfigChange = function (config) {
                this.config = config;
                this.paging.page = 1;
                this.filters = {};
                this.filter();
            };
            configurationCtrl.prototype.filter = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.loadFunc(ctrl.config, ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            configurationCtrl.prototype.edit = function (id) {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.showForm = true;
                ctrl.getFunc(ctrl.config, id).then(function (result) {
                    ctrl.entity = result.data;
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            configurationCtrl.prototype.save = function () {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.saveFunc(ctrl.config, ctrl.entity).then(function (result) {
                    ctrl.notify('success', 'Data berhasil disimpan');
                    ctrl.showForm = false;
                    ctrl.filter();
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            configurationCtrl.prototype.delete = function (id) {
                var confirmed = confirm('Data akan dihapus, anda yakin?');
                if (!confirmed)
                    return;
                var ctrl = this;
                ctrl.deleteFunc(ctrl.config, id).then(function (result) {
                    ctrl.notify('success', 'Data berhasil dihapus');
                    ctrl.filter();
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                });
            };
            configurationCtrl.$inject = ['$scope', 'Notification'];
            return configurationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('configurationCtrl', configurationCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
