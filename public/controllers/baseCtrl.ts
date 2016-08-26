module lois.controllers{
  export class baseCtrl{
     showToolbar: boolean;
     showForm: boolean;
     loadingData: boolean;
     checkedAll: boolean;
     loadFunc: Function;
     getFunc: Function;
     saveFunc: Function;
     deleteFunc: Function;
     filters: any;
     query: any;
     paging: any;
     entity: any;
     entities: any[];
     
     constructor(public notification){
        this.showToolbar = false;
        this.showForm = false;
        this.checkedAll = false;
        this.loadingData = false;
        this.filters = {};
        this.query = {};
        this.paging = {page: 1, max: 10, total: 0};
     }

     filter(): void{
        var ctrl = this;

        ctrl.checkedAll = false;
        ctrl.createQuery();
        ctrl.loadingData = true;

        ctrl.loadFunc(ctrl.query).then(result => {
           ctrl.entities = result.data;
        }).catch(exception => {
           ctrl.notify('error', exception.data);
        }).finally(() => {
           ctrl.loadingData = false;
        });
     }

     createQuery(): void{
        this.query = {};
        this.createPagingQuery();

        if(this.filters['fromDate'] && this.filters['toDate']){
           var from = new Date(this.filters['fromDate']);
           var to = new Date(this.filters['toDate']);
           this.query['from'] = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
           this.query['to'] = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
        }

        if(this.filters['recapDate']){
           var recapDate = new Date(this.filters['recapDate']);
           this.query['recapDate'] = Date.UTC(recapDate.getFullYear(), recapDate.getMonth(), recapDate.getDate());
        }

        var keys = Object.keys(this.filters);

        for(var i=0; i<keys.length; i++){
           var key = keys[i];

           if(this.filters[key] && this.filters[key]['_id'])
              this.query[key] = this.filters[key]['_id'];
           else
             this.query[key] = this.filters[key];
        }
     }

     createPagingQuery(): void{
        this.query['limit'] = this.paging.max;
        this.query['skip'] = (this.paging.page - 1) * this.paging.max;
     }


     notify(type: string, message: string): void {
       this.notification[type](message);
     }
  }
}
