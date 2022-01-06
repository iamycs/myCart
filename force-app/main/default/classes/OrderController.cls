public with sharing class OrderController {
    @AuraEnabled(Cacheable=true)
    public static OrderItem[] getOrderItems(Id orderId) {
        return [ SELECT Id,Quantity,UnitPrice,TotalPrice,Product2.Name,Product2.Price__c,Product2.Description,Order.Status FROM OrderItem
            WHERE OrderId = :orderId
            WITH SECURITY_ENFORCED
        ];
    }

    @AuraEnabled(Cacheable=true)
    public static String getOrderInfo(Id orderId) {
        Order o = [
            SELECT
                Id,
                Status
            FROM Order
            WHERE Id = :orderId
            WITH SECURITY_ENFORCED
        ];
        return o.Status;
    }
    @AuraEnabled
    public static string confirmOrder(Id orderId){
        try {
            if(orderId != null){
                Order ordr = [Select Id, Account.accountNumber,OrderNumber,Type,Status, (Select Id,Product2.Name,Status__c, Product2.ProductCode , UnitPrice,Quantity from OrderItems) from Order where Id =:orderId];
                JSONGenerator gen = JSON.createGenerator(true);
                gen.writeStartObject();
                gen.writeStringField('AccountNumber',ordr.Account.accountNumber);
                gen.writeStringField('OrderNumber',ordr.OrderNumber);
                gen.writeStringField('Type',ordr.Type);
                gen.writeStringField('Status',ordr.Status);
                gen.writeFieldName('OrderProducts'); 
                    gen.writeStartArray();
                    for(OrderItem oi : ordr.OrderItems){     
                        gen.writeStartObject();    
                        gen.writeStringField('Name', oi.Product2.name);
                        gen.writeStringField('ProductCode',oi.Product2.ProductCode);
                        gen.writeNumberField('UnitPrice',oi.UnitPrice);
                        gen.writeNumberField('Quantity',Integer.valueOf(oi.Quantity));
                        gen.writeEndObject();
                        }
                    gen.writeEndArray();    
                gen.writeEndObject();            

            String calloutURI = 'https://mycart.requestcatcher.com/test';
            HttpRequest req = new HttpRequest();
            req.setEndpoint(calloutURI);
            req.setMethod('POST');
            req.setBody(gen.getAsString());
            System.debug('request here++:'+gen.getAsString());
            Http http = new Http();
            HTTPResponse res = http.send(req);
            System.debug(res.getstatusCode());
            if(res.getstatusCode() == 200){
             ordr.Status ='Activated';
             update ordr;
             for(OrderItem oi : ordr.OrderItems){
                 oi.Status__c ='Activated';
             }
             if(ordr.OrderItems.size()>0){
                 update ordr.OrderItems;
                }
            }                
            return String.ValueOf(res.getstatusCode());
            }
            return 'Invalid Order';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}