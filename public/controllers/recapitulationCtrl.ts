module lois.controllers{
  enum FilterType {recap = 0, cancelRecap = 1};

  class recapitulationCtrl extends baseCtrl{
      filterType: FilterType;
      vehicleNumber: string;
      driver: any;
      trainType: any;
      departureDate: any;

      static $inject = ['$scope', 'Notification'];

      constructor($scope, Notification){
          super(Notification);
          this.filterType = FilterType.recap;
          this.filter();
      }

      filter(): void {
        var ctrl = this;

        ctrl.checkedAll = false;
        ctrl.createQuery();
        ctrl.loadingData = true;
        ctrl.loadFunc = ctrl.filterType === FilterType.recap ? app.api.recapitulation.getAll : app.api.recapitulation.getAllCancel;

        ctrl.loadFunc(ctrl.query).then(result => {
           ctrl.entities = result.data;
           ctrl.entities.map(e => {
              e['viewModel'] = {};
              e['viewModel']['limasColor'] = null;
              e['viewModel']['relationColor'] = null;
              e['viewModel']['notes'] = null;
              e['viewModel']['quantity'] = ctrl.filterType === FilterType.recap ? e.items.colli.available : e.items.recapitulations.available;
           });
        }).catch(error => {
            ctrl.notify('error', error.data);
        }).finally(() => {
            ctrl.loadingData = false;
        });
      }

      process(): void{

         if(this.filterType === FilterType.recap){
            if(!this.driver){
               this.notify('warning', 'Supir harus diisi');
               return;
            }

            if(!this.trainType){
               this.notify('warning', 'Jenis kereta harus diisi');
               return;
            }

            if(!this.departureDate || this.departureDate == ''){
               this.notify('warning', 'Tanggal berangkat harus diisi')
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

            var departureDate = new Date(this.departureDate);
            var viewModel = {
              shippingId: entity._id,
              itemId: entity.items._id,
              quantity: entity.viewModel.quantity,
              limasColor: entity.viewModel.limasColor,
              relationColor: entity.viewModel.relationColor,
              notes: entity.viewModel.notes,
              driver: this.filterType === FilterType.recap ? this.driver._id : null,
              trainType: this.filterType === FilterType.recap ? this.trainType._id : null,
              vehicleNumber: this.filterType === FilterType.recap ? this.vehicleNumber : null,
              departureDate: Date.UTC(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate())
            };

            if(this.filterType === FilterType.cancelRecap)
              viewModel['recapitulationId'] = entity.items.recapitulations._id;

            viewModels.push(viewModel);
        });

        var ctrl = this;
        var processFunc = ctrl.filterType === FilterType.recap ? app.api.recapitulation.recap : app.api.recapitulation.cancelRecap;

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

  app.lois.controller('recapitulationCtrl', recapitulationCtrl);
}
