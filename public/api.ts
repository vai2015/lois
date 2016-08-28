module app.api{
   export class user {
      static authenticate(data: any){
         return app.http.post('/lois/api/user/authenticate', JSON.stringify(data));
      }

      static logout(){
         return app.http.get('/lois/api/user/logout');
      }

      static getSession(){
         return app.http.get('/lois/api/user/getSession');
      }
   }

   export class shipping {
      static get(id: any){
         return app.http.get('/lois/api/shipping/get?id=' + id);
      }

      static getAll(query: any){
         return app.http.get('/lois/api/shipping/getAll?query=' + JSON.stringify(query));
      }

      static add(){
         return app.http.post('/lois/api/shipping/add', null);
      }

      static save(data: any){
         return app.http.post('/lois/api/shipping/save', JSON.stringify(data));
      }
   }

   export class recapitulation{
      static getAll(query: any){
         return app.http.get('/lois/api/recapitulation/getAll?query=' + JSON.stringify(query));
      }

      static getAllCancel(query: any){
         return app.http.get('/lois/api/recapitulation/getAllCancel?query=' + JSON.stringify(query));
      }

      static recap(data: any){
         return app.http.post('/lois/api/recapitulation/recap', JSON.stringify(data));
      }

      static cancelRecap(data: any){
         return app.http.post('/lois/api/recapitulation/cancelRecap', JSON.stringify(data));
      }
   }

   export class delivery{
      static getAll(query: any){
         return app.http.get('/lois/api/delivery/getAll?query=' + JSON.stringify(query));
      }

      static getAllCancel(query: any){
         return app.http.get('/lois/api/delivery/getAllCancel?query=' + JSON.stringify(query));
      }

      static delivery(data: any){
         return app.http.post('/lois/api/delivery/delivery', JSON.stringify(data));
      }

      static cancelDelivery(data: any){
         return app.http.post('/lois/api/delivery/cancelDelivery', JSON.stringify(data));
      }
   }

   export class _return{
      static getAll(query: any){
         return app.http.get('/lois/api/return/getAll?query=' + JSON.stringify(query));
      }

      static getConfirmReturns(query: any){
         return app.http.get('/lois/api/return/getConfirmReturns?query=' + JSON.stringify(query));
      }

      static return(data: any){
         return app.http.post('/lois/api/return/return', JSON.stringify(data));
      }

      static confirm(data: any){
         return app.http.post('/lois/api/return/confirm', JSON.stringify(data));
      }

      static upload(data: any){
        return app.http.post('/lois/api/return/upload', JSON.stringify(data))
      }
   }

   export class payment {
     static getAll(query: any){
        return app.http.get('/lois/api/payment/getAll?query=' + JSON.stringify(query));
     }

     static pay(data: any){
        return app.http.post('/lois/api/payment/pay', JSON.stringify(data));
     }
   }

   export class invoice {
     static getAll(query: any){
        return app.http.get('/lois/api/invoice/getAll?query=' + JSON.stringify(query));
     }

     static getList(query: any){
        return app.http.get('/lois/api/invoice/getList?query=' + JSON.stringify(query));
     }

     static create(data: any){
        return app.http.post('/lois/api/invoice/create', JSON.stringify(data));
     }
   }

   export class report {
      static getRecapitulations(query: any){
         return http.get('/lois/api/report/getRecapitulations?query=' + JSON.stringify(query));
      }

      static getRecapitulationsReport(data: any){
         return http.post('/lois/api/report/getRecapitulationsReport', JSON.stringify(data));
      }

      static getDeliveries(query: any){
         return http.get('/lois/api/report/getDeliveries?query=' + JSON.stringify(query));
      }

      static getDeliveriesReport(data: any){
         return http.post('/lois/api/report/getDeliveriesReport', JSON.stringify(data));
      }

      static getReturn(query: any){
         return http.get('/lois/api/report/getReturn?query=' + JSON.stringify(query));
      }

      static getUnconfirmed(query: any){
         return http.get('/lois/api/report/getUnconfirmed?query=' + JSON.stringify(query));
      }
   }

   export class reportPrint{
     static printRecapitulation(data: any){
         var config = {
            "headers": {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            "responseType": "arraybuffer"
         };

         return app.http.post('http://limassentosa.net/report-engine/recapitulation', JSON.stringify(data), config);
     }

     static printDelivery(data: any){
         var config = {
            "headers": {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            "responseType": "arraybuffer"
         };

         return app.http.post('http://limassentosa.net/report-engine/delivery', JSON.stringify(data), config);
     }

     static printReturn(data: any){
         var config = {
            "headers": {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            "responseType": "arraybuffer"
         };

         return app.http.post('http://limassentosa.net/report-engine/return', JSON.stringify(data), config);
     }

     static printInvoice(data: any){
         var config = {
            "headers": {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            "responseType": "arraybuffer"
         };

         return app.http.post('http://limassentosa.net/report-engine/invoice', JSON.stringify(data), config);
     }
  }

   export class configuration {
     static get(config: string, id: any){
        return app.http.get('/lois/api/' + config + '/get?id=' + id);
     }

     static getAll(config: string, query: any){
        return app.http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
     }

     static save(config: string, data: any){
       return app.http.post('/lois/api/' + config + '/save', JSON.stringify(data));
     }

     static delete(config: string, id: any){
       return app.http.delete('/lois/api/' + config + '/delete?id=' + id);
     }
   }

   export class autocomplete{
     static getAll(name: string, keyword: string){
         return app.http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({"name" : keyword}));
     }
  }
}
