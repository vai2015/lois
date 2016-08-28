module lois.controllers {
   class confirmReturnCtrl extends baseCtrl{
     static $inject = ['$scope', 'Notification'];

      constructor($scope, Notification){
         super(Notification);
         this.showToolbar = true;
         this.loadFunc = app.api._return.getConfirmReturns;
         this.filter();
      }

      process(): void {
         var checkedEntities = this.entities.filter(e => e.checked);

         if(checkedEntities.length === 0){
            this.notify('warning', 'Tidak ada pengiriman yang dipilih');
            return;
         }

         var ctrl = this;
         app.api._return.confirm(checkedEntities).then(result => {
            ctrl.notify('success', 'Konfirmasi berhasil');
            ctrl.filter();
         }).catch(error => {
            ctrl.notify('error', 'Konfirmasi gagal ' + error.data);
         });
      }
   }

   app.lois.controller('confirmReturnCtrl', confirmReturnCtrl);
}
