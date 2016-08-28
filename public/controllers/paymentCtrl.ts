module lois.controllers {
  enum ViewType {payment=0, phases=1};

  class paymentCtrl extends baseCtrl{
     paymentType: any;
     date: any;
     viewType: ViewType;
     selectedEntity: any;

     static $inject = ['$scope', 'Notification'];

     constructor($scope, Notification){
       super(Notification);
       this.viewType = ViewType.payment;
       this.loadFunc = app.api.payment.getAll;
       this.filter();
     }

     pay(): void {
       if(!this.date || this.date == ''){
          this.notify('warning', 'Tanggal transfer harus diisi')
          return;
       }

       var checkedEntities = this.entities.filter(e => e.checked);

       if(checkedEntities.length === 0){
          this.notify('warning', 'Tidak ada pengiriman yang dipilih');
          return;
       }

       var transferDate = new Date(this.date);
       var viewModels = [];

       checkedEntities.forEach(entity => {
            viewModels.push({
              shippingId: entity._id,
              bank: entity.viewModel.bank,
              notes: entity.viewModel.notes,
              amount: entity.viewModel.amount,
              date: Date.UTC(transferDate.getFullYear(), transferDate.getMonth(), transferDate.getDate()),
              paymentTypeId: this.paymentType ? this.paymentType._id : entity.payment.type._id
            });
        });

        var ctrl = this;
        app.api.payment.pay(viewModels).then(result => {
            ctrl.notify('success', 'Proses pembayaran berhasil');
            ctrl.filter();
        }).catch(error => {
            ctrl.notify('error', 'Proses pembayaran gagal ' + error.data);
        });
     }

     viewPhases(entity: any): void {
        this.viewType = ViewType.phases;
        this.selectedEntity = entity;
     }

     viewPayments(): void{
        this.viewType = ViewType.payment;
        this.selectedEntity = null;
     }
  }

  app.lois.controller('paymentCtrl', paymentCtrl);
}
