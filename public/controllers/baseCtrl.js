var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var baseCtrl = (function () {
            function baseCtrl(notification) {
                this.notification = notification;
                this.showToolbar = false;
                this.showForm = false;
                this.checkedAll = false;
                this.loadingData = false;
                this.processing = false;
                this.filters = {};
                this.query = {};
                this.paging = { page: 1, max: 10, total: 0 };
            }
            baseCtrl.prototype.filter = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.loadFunc(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            baseCtrl.prototype.add = function () {
                this.entity = null;
                this.showForm = true;
            };
            baseCtrl.prototype.edit = function (id) {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.showForm = true;
                ctrl.getFunc(id).then(function (result) {
                    ctrl.entity = result.data;
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            baseCtrl.prototype.save = function () {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.saveFunc(ctrl.entity).then(function (result) {
                    ctrl.notify('success', 'Data berhasil disimpan');
                    ctrl.showForm = false;
                    ctrl.filter();
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            baseCtrl.prototype.delete = function (id) {
                var confirmed = confirm('Data akan dihapus, anda yakin?');
                if (!confirmed)
                    return;
                var ctrl = this;
                ctrl.deleteFunc(id).then(function (result) {
                    ctrl.notify('success', 'Data berhasil dihapus');
                    ctrl.filter();
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                });
            };
            baseCtrl.prototype.createQuery = function () {
                this.query = {};
                this.createPagingQuery();
                var keys = Object.keys(this.filters);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (this.filters[key] && this.filters[key]['_id'])
                        this.query[key] = this.filters[key]['_id'];
                    else
                        this.query[key] = this.filters[key];
                }
                if (this.filters['from'] && this.filters['to']) {
                    var from = new Date(this.filters['from']);
                    var to = new Date(this.filters['to']);
					
                    this.query['from'] = dateFormat(from);
                    this.query['to'] = dateFormat(to);
                }
                if (this.filters['recapDate']) {
                    var date = new Date(this.filters['recapDate']);
                    this.query['recapDate'] = dateFormat(date);
                }
                if (this.filters['date']) {
                    var date = new Date(this.filters['date']);
                    this.query['date'] = dateFormat(date);
                }
                if (this.filters['transferDate']) {
                    var date = new Date(this.filters['transferDate']);
                    this.query['transferDate'] = dateFormat(date);
                }
                if (this.filters['paymentDate']) {
                    var date = new Date(this.filters['paymentDate']);
                    this.query['paymentDate'] = dateFormat(date);
                }
                if (this.filters['deliveryDate']) {
                    var date = new Date(this.filters['deliveryDate']);
                    this.query['deliveryDate'] = dateFormat(date);
                }
            };
            baseCtrl.prototype.createPagingQuery = function () {
                this.query['limit'] = this.paging.max;
                this.query['skip'] = (this.paging.page - 1) * this.paging.max;
            };
            baseCtrl.prototype.next = function () {
                if (this.entities.length === 0)
                    return;
                this.paging.page += 1;
                this.filter();
            };
            baseCtrl.prototype.prev = function () {
                if ((this.paging.page - 1) <= 0)
                    return;
                this.paging.page -= 1;
                this.filter();
            };
            baseCtrl.prototype.toggleShowForm = function (show) {
                this.showForm = show;
                this.entity = null;
            };
            baseCtrl.prototype.toggleCheckAll = function () {
                var _this = this;
                this.entities.map(function (e) { return e.checked = _this.checkedAll; });
            };
            baseCtrl.prototype.notify = function (type, message) {
                this.notification[type](message);
            };
            baseCtrl.prototype.suggest = function (name, keyword) {
                return app.api.autocomplete.getAll(name, keyword).then(function (result) {
                    return result.data;
                });
            };
            return baseCtrl;
        }());
        controllers.baseCtrl = baseCtrl;
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));

function dateFormat(date_format){
	var UTC_date = new Date(Date.UTC(date_format.getFullYear(), date_format.getMonth(), date_format.getDate()));
	var format_date = UTC_date.getDate();
	var format_month = UTC_date.getMonth()+1;
	var format_year = UTC_date.getFullYear();
	return format_year+"/"+format_month+"/"+format_date;
}
