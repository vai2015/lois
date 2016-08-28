module lois.controllers {
  enum InvoiceType {Semua = 1, Klien = 2, Partner = 3};

  class invoiceCtrl extends baseCtrl{
    tab: string;
    invoiceType: InvoiceType;
    to: string;
    location: string;

    static $inject = ['$scope', 'Notification'];

    constructor($scope, Notification){
       super(Notification);
       this.tab = 'create';
       this.loadFunc = app.api.invoice.getAll;
       this.invoiceType = InvoiceType.Semua;
       this.filter();
    }

    onTabChange(tab: string): void {
       this.tab = tab;

      if(this.tab === 'create')
        this.loadFunc = app.api.invoice.getAll;

      else if(this.tab === 'list')
        this.loadFunc = app.api.invoice.getList;

      this.filter();
    }

    print(entity): void {
        var ctrl = this;
        app.api.report.getInvoiceReport(entity).then(result => {
          app.api.reportPrint.printInvoice(result.data).then(buffer => {
            var blob = new Blob([buffer.data], {type:'application/pdf'});
            var url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          });
        });
    }

    create(): void {
       if(!this.to || this.to === ''){
          this.notify('warning', 'Tertagih harus diisi');
          return;
       }

       if(!this.location || this.location === ''){
          this.notify('warning', 'Lokasi tertagih harus diisi');
          return;
       }

       var checkedEntities = this.entities.filter(e => e.checked);

       if(checkedEntities.length === 0){
          this.notify('warning', 'Tidak ada pengiriman yang dipilih');
          return;
       }

       var viewModels = [];
       checkedEntities.forEach(e => {
           viewModels.push({
             shippingId: e._id,
             to: this.to,
             location: this.location,
             type: InvoiceType[this.invoiceType]
           });
       });

       var ctrl = this;
       app.api.invoice.create(viewModels).then(result => {
          ctrl.notify('success', 'Tagihan berhasil dibuat');
          ctrl.filter();
       }).catch(error => {
          ctrl.notify('error', 'Tagihan gagal dibuat ' + error.data);
       });
    }
  }

  app.lois.controller('invoiceCtrl', invoiceCtrl);
}
