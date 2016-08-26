module lois.controllers{
  export class baseCtrl{
     showToolbar: boolean;
     showForm: boolean;
     loadFunc: Function;
     getFunc: Function;
     saveFunc: Function;
     deleteFunc: Function;
     filters: any;
     query: any;
     paging: any;

     constructor(public notification){
        this.showToolbar = false;
        this.showForm = false;
        this.filters = {};
        this.query = {};
        this.paging = {page: 1, max: 10, total: 0};
     }

     notify(type: string, message: string): void {
       this.notification[type](message);
     }
  }
}
