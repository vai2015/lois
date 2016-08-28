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
       this.invoiceType = InvoiceType.Semua;
       this.filter();
    }
  }

  app.lois.controller('invoiceCtrl', invoiceCtrl);
}
