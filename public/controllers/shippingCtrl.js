var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var ViewType;
        (function (ViewType) {
            ViewType[ViewType["shipping"] = 1] = "shipping";
            ViewType[ViewType["item"] = 2] = "item";
        })(ViewType || (ViewType = {}));
        ;
        var shippingCtrl = (function (_super) {
            __extends(shippingCtrl, _super);
            function shippingCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.loadFunc = app.api.shipping.getAll;
                this.saveFunc = app.api.shipping.save;
                this.getFunc = app.api.shipping.get;
                this.viewType = ViewType.shipping;
                this.filter();
            }
            shippingCtrl.prototype.filter = function () {
                var ctrl = this;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.loadFunc(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    if (ctrl.viewType == ViewType.item) {
                        var entity = ctrl.entities.filter(function (e) { return e['_id'] === ctrl.selectedEntity['_id']; })[0];
                        ctrl.viewItems(entity);
                    }
                }).catch(function (exception) {
                    ctrl.notify('error', exception);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            shippingCtrl.prototype.add = function () {
                var ctrl = this;
                ctrl.loadingData = true;
                app.api.shipping.add().then(function (result) {
                    ctrl.notify('success', 'Spb berhasil ditambah');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            shippingCtrl.prototype.addItem = function () {
                this.selectedItem = this.constructItem();
                this.showForm = true;
            };
            shippingCtrl.prototype.editItem = function (item) {
                if (item.status === 'Retur' || item.status === 'Surat Jalan Balik') {
                    this.notify('warning', 'Item dengan status Retur atau Surat Jalan Balik tidak dapat diedit');
                    return;
                }
                if (item.audited) {
                    this.notify('warning', 'Item ini sedang dalam audit manager');
                    return;
                }
                this.selectedItem = item;
                this.showForm = true;
            };
            shippingCtrl.prototype.saveItem = function () {
                if (this.selectedItem.itemType == null) {
                    this.notify('warning', 'Jenis barang harus diisi');
                    return;
                }
                console.log(this.selectedItem);
                var index = this.selectedEntity['items'].indexOf(this.selectedItem);
                if (index < 0)
                    this.selectedEntity['items'].push(this.selectedItem);
                this.entity = this.selectedEntity;
                var ctrl = this;
                this.save();
            };
            shippingCtrl.prototype.deleteItem = function (item) {
                var confirmed = confirm('Item akan dihapus, anda yakin?');
                if (!confirmed)
                    return;
                var index = this.selectedEntity['items'].indexOf(item);
                if (index < 0) {
                    this.notify('warning', 'Item tidak ditemukan');
                    return;
                }
                this.selectedEntity['items'].splice(index, 1);
                this.entity = this.selectedEntity;
                this.save();
            };
            shippingCtrl.prototype.viewItems = function (entity) {
                this.viewType = ViewType.item;
                this.selectedEntity = entity;
                this.showToolbar = false;
            };
            shippingCtrl.prototype.viewShipping = function () {
                this.viewType = ViewType.shipping;
                this.selectedEntity = null;
                this.selectedItem = null;
            };
            shippingCtrl.prototype.constructItem = function () {
                return {
                    itemType: null,
                    packingType: null,
                    content: null,
                    dimensions: { length: 0, width: 0, height: 0, weight: 0 },
                    colli: { quantity: 0, available: 0, delivered: 0 },
                    cost: { colli: 0, shipping: 0, additional: 0, discount: 0 },
                    recapitulations: [],
                    deliveries: [],
                    status: 'Belum Terekap',
                    audited: false
                };
            };
            shippingCtrl.prototype.toggleShowItemForm = function (show) {
                this.showForm = show;
                this.selectedItem = null;
            };
            shippingCtrl.$inject = ['$scope', 'Notification'];
            return shippingCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('shippingCtrl', shippingCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
