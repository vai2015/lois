module lois.controllers {
  enum FilterType {delivery = 0, cancelDelivery = 1};

  class deliveryCtrl extends baseCtrl{
    filterType: FilterType;
    vehicleNumber: string;
    driver: any;
    deliveryCode: string;

    static $inject = ['$scope', 'Notification'];

    constructor($scope, Notification){
        super(Notification);
        this.filterType = FilterType.delivery;
        this.filter();
    }

    filter(): void {
      var ctrl = this;
      ctrl.checkedAll = false;
      ctrl.createQuery();
      ctrl.loadingData = true;
      ctrl.loadFunc = ctrl.filterType === FilterType.delivery ? app.api.delivery.getAll : app.api.delivery.getAllCancel;

      ctrl.loadFunc(ctrl.query).then(result => {
         ctrl.entities = result.data;
         ctrl.entities.map(e => {
            e['viewModel'] = {};
            e['viewModel']['limasColor'] = null;
            e['viewModel']['relationColor'] = null;
            e['viewModel']['notes'] = null;
            e['viewModel']['quantity'] = ctrl.filterType === FilterType.delivery ? e.items.recapitulations.available : e.items.deliveries.available;
         });
      }).catch(error => {
          ctrl.notify('error', error.data);
      }).finally(() => {
          ctrl.loadingData = false;
      });
    }

    process(): void {
      if(this.filterType === FilterType.delivery){
        if(!this.driver){
           this.notify('warning', 'Supir harus diisi');
           return;
        }

        if(!this.vehicleNumber || this.vehicleNumber == ''){
           this.notify('warning', 'No mobil harus diisi')
           return;
        }
      }

      var checkedEntities = this.entities.filter(e => e.checked);

      if(checkedEntities.length === 0){
         this.notify('warning', 'Tidak ada item yang dipilih');
         return;
      }

      var viewModels = [];

      checkedEntities.forEach(entity => {
          var viewModel = {
            shippingId: entity._id,
            itemId: entity.items._id,
            recapitulationId: entity.items.recapitulations._id,
            quantity: entity.viewModel.quantity,
            limasColor: entity.viewModel.limasColor,
            relationColor: entity.viewModel.relationColor,
            deliveryCode: entity.viewModel.deliveryCode,
            driver: this.filterType === FilterType.delivery ? this.driver._id : null, 
            vehicleNumber: this.vehicleNumber
          };

          if(this.filterType === FilterType.cancelDelivery)
            viewModel['deliveryId'] = entity.items.deliveries._id;

          viewModels.push(viewModel);
      });

      var ctrl = this;
      var processFunc = ctrl.filterType === FilterType.delivery ? app.api.delivery.delivery : app.api.delivery.cancelDelivery;

      ctrl.loadingData = true;

      processFunc(viewModels).then(result => {
         ctrl.notify('success', 'Proses berhasil');
         ctrl.filter();
      }).catch(error => {
         ctrl.notify('error', 'Rekapitulasi gagal ' + error.data);
      }).finally(() => {
         ctrl.loadingData = false;
      });
    }
  }

  app.lois.controller('deliveryCtrl', deliveryCtrl);
}
