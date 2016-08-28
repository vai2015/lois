var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var FilterType;
        (function (FilterType) {
            FilterType[FilterType["recap"] = 0] = "recap";
            FilterType[FilterType["cancelRecap"] = 1] = "cancelRecap";
        })(FilterType || (FilterType = {}));
        ;
        var recapitulationCtrl = (function (_super) {
            __extends(recapitulationCtrl, _super);
            function recapitulationCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.filterType = FilterType.recap;
                this.filter();
            }
            recapitulationCtrl.prototype.filter = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.loadFunc = ctrl.filterType === FilterType.recap ? app.api.recapitulation.getAll : app.api.recapitulation.getAllCancel;
                ctrl.loadFunc(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    ctrl.entities.map(function (e) {
                        e['viewModel'] = {};
                        e['viewModel']['limasColor'] = null;
                        e['viewModel']['relationColor'] = null;
                        e['viewModel']['notes'] = null;
                        e['viewModel']['quantity'] = ctrl.filterType === FilterType.recap ? e.items.colli.available : e.items.recapitulations.available;
                    });
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            recapitulationCtrl.prototype.process = function () {
                var _this = this;
                if (this.filterType === FilterType.recap) {
                    if (!this.driver) {
                        this.notify('warning', 'Supir harus diisi');
                        return;
                    }
                    if (!this.trainType) {
                        this.notify('warning', 'Jenis kereta harus diisi');
                        return;
                    }
                    if (!this.departureDate || this.departureDate == '') {
                        this.notify('warning', 'Tanggal berangkat harus diisi');
                        return;
                    }
                    if (!this.vehicleNumber || this.vehicleNumber == '') {
                        this.notify('warning', 'No mobil harus diisi');
                        return;
                    }
                }
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada item yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    var departureDate = new Date(_this.departureDate);
                    var viewModel = {
                        shippingId: entity._id,
                        itemId: entity.items._id,
                        quantity: entity.viewModel.quantity,
                        limasColor: entity.viewModel.limasColor,
                        relationColor: entity.viewModel.relationColor,
                        notes: entity.viewModel.notes,
                        driver: _this.filterType === FilterType.recap ? _this.driver._id : null,
                        trainType: _this.filterType === FilterType.recap ? _this.trainType._id : null,
                        vehicleNumber: _this.filterType === FilterType.recap ? _this.vehicleNumber : null,
                        departureDate: Date.UTC(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate())
                    };
                    if (_this.filterType === FilterType.cancelRecap)
                        viewModel['recapitulationId'] = entity.items.recapitulations._id;
                    viewModels.push(viewModel);
                });
                var ctrl = this;
                var processFunc = ctrl.filterType === FilterType.recap ? app.api.recapitulation.recap : app.api.recapitulation.cancelRecap;
                ctrl.loadingData = true;
                processFunc(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Rekapitulasi gagal ' + error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            recapitulationCtrl.$inject = ['$scope', 'Notification'];
            return recapitulationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('recapitulationCtrl', recapitulationCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
