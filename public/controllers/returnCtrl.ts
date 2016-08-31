module lois.controllers {
   class returnCtrl extends baseCtrl{
      files: any[];

      static $inject = ['$scope', 'Notification'];

      constructor($scope, Notification){
          super(Notification);
          this.showToolbar = true;
          this.loadFunc = app.api._return.getAll;
          this.filter();
       }

       upload(file, entity): void{
          var fd = new FormData();
          fd.append('file', file);
          console.log(fd);
          app.api._return.upload(fd).then(result => {
              console.log(result.data);
          });
       }

       process(): void {
          var checkedEntities = this.entities.filter(e => e.checked);

          if(checkedEntities.length === 0){
             this.notify('warning', 'Tidak ada pengiriman yang dipilih');
             return;
          }

          var viewModels = [];

          checkedEntities.forEach(entity => {
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
               concernedPerson: entity.viewModel.concernedPerson
             });
         });

         var ctrl = this;

         app.api._return.return(viewModels).then(result => {
            ctrl.notify('success', 'Proses retur berhasil');
            ctrl.filter();
         }).catch(error => {
            ctrl.notify('error', 'Proses retur gagal ' + error.data);
         });
       }
   }

   app.lois.controller('returnCtrl', returnCtrl);
}
