module lois.controllers{
  export class baseCtrl{
     showToolbar: boolean;
     showForm: boolean;
     loadingData: boolean;
     checkedAll: boolean;
     processing: boolean;
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
        this.processing = false;
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

     edit(id: any): void {
        var ctrl = this;
        ctrl.processing = true;
        ctrl.showForm = true;

        ctrl.getFunc(id).then(result => {
           ctrl.entity = result.data;
        }).catch(exception => {
           ctrl.notify('error', exception.data);
        }).finally(() => {
           ctrl.processing = false;
        });
     }

     save(): void {
       var ctrl = this;
       ctrl.processing = true;

       ctrl.saveFunc(ctrl.entity).then(result => {
          ctrl.notify('success', 'Data berhasil disimpan');
          ctrl.showForm = false;
          ctrl.filter();
       }).catch(exception => {
          ctrl.notify('error', exception.data);
       }).finally(() => {
          ctrl.processing = false;
       });
     }

     delete(id): void {
        var confirmed = confirm('Data akan dihapus, anda yakin?');

        if(!confirmed)
          return;

        var ctrl = this;
        ctrl.deleteFunc(id).then(result => {
           ctrl.notify('success', 'Data berhasil dihapus');
           ctrl.filter();
        }).catch(exception => {
           ctrl.notify('error', exception.data);
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

     next(): void {
        if(this.entities.length === 0)
         return;

        this.paging.page += 1;
        this.filter();
     }

     prev(): void {
        if((this.paging.page - 1) <= 0)
          return;

        this.paging.page -= 1;
        this.filter();
     }

     toggleShowForm(show: boolean): void {
       this.showForm = show;
       this.entity = null;
     }

     toggleCheckAll(): void {
        this.entities.map(e => e.checked = this.checkedAll);
     }

     notify(type: string, message: string): void {
       this.notification[type](message);
     }

     suggest(name: string, keyword: string) {
       return app.api.autocomplete.getAll(name, keyword).then(result => {
          return result.data;
       });
    }
  }
}
