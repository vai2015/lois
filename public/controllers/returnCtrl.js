var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var returnCtrl = (function (_super) {
            __extends(returnCtrl, _super);
            function returnCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.showToolbar = true;
                this.loadFunc = app.api._return.getAll;
                this.filter();
            }
            returnCtrl.prototype.filter = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.loadFunc(ctrl.query).then(function (result) {
                    var shippings = result.data.map(function (e) { return e.shipping[0]; });
                    ctrl.entities = shippings;
                    ctrl.entities.map(function (e) {
                        e['viewModel'] = {};
                    });
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            returnCtrl.prototype.upload = function (file, entity) {
                var fd = new FormData();
                fd.append('file', file);
                entity['viewModel']['filePath'] = [];
                var ctrl = this;
                app.api._return.upload(fd).then(function (result) {
                    entity['viewModel']['filePath'] = result.data['filename'];
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            returnCtrl.prototype.process = function () {
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    viewModels.push({
                        shippingId: entity._id,
                        itemId: entity.items._id,
                        limasColor: entity.viewModel.limasColor,
                        relationColor: entity.viewModel.relationColor,
                        relationCode: entity.viewModel.relationCode,
                        accepted: entity.viewModel.accepted,
                        stamped: entity.viewModel.stamped,
                        signed: entity.viewModel.signed,
                        notes: entity.viewModel.notes,
                        received: entity.viewModel.received,
                        filePath: entity.viewModel.filePath,
                        concernedPerson: entity.viewModel.concernedPerson
                    });
                });
                var ctrl = this;
                app.api._return.return(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses retur berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Proses retur gagal ' + error.data);
                });
            };
            returnCtrl.$inject = ['$scope', 'Notification'];
            return returnCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('returnCtrl', returnCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
