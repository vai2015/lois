module lois.controllers {
   class deliveryOrderCtrl extends baseCtrl{
      static $inject = ['$scope', 'Notification'];

      constructor($scope, Notification){
         super(Notification);
         this.loadFunc = app.api.deliveryOrder.getAll;
         this.filter();
      }

      print(entity: any): void {
         var ctrl = this;

         ctrl.loadingData = true;
         app.api.deliveryOrder.getDataReport(entity).then(result => {
            app.api.reportPrint.printDeliveryOrder(result.data).then(buffer => {
              var blob = new Blob([buffer.data], {type:'application/pdf'});
              var url = URL.createObjectURL(blob);
              window.open(url, '_blank');
            });
         }).finally(() => {
             ctrl.loadingData = false;
         });
      }
   }

   app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
}
