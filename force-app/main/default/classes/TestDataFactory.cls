@isTest
public with sharing  class TestDataFactory {
    
    
    public static priceBook2 createPriceBook(String name) {
        priceBook2 pb = new priceBook2();
        pb.name=name;
        Database.insert(pb);
        return pb;
    }
    
    public static PricebookEntry createPricebookEntry(Decimal unitPrice,Id priceBook2Id,Id product2Id,Boolean isActive){
        PriceBookEntry priceBookEntry=new PriceBookEntry();
        priceBookEntry.pricebook2id= priceBook2Id;
        priceBookEntry.product2id = product2Id;
        priceBookEntry.unitprice=unitPrice;
        priceBookEntry.isActive=isActive;
        Database.insert(priceBookEntry);
        return priceBookEntry;
   }
   public static order createOrder(String name ,Id pricebook2Id ,Id accountId, Date effectiveDate, String status){
        order order = new order(); 
        order.Name = name; 
        order.PriceBook2Id= pricebook2Id;
        order.AccountId=accountId;
        order.Status=status;
        order.Type='Sales';
        order.EffectiveDate=effectiveDate;
        Database.insert(order);   
        return order;     
    }
    
          
    public static OrderItem createOrderItem(Id orderId,Integer quantity, Decimal unitPrice, Id pbe){
        OrderItem oli= new OrderItem ();
        oli.OrderId=orderId;
        oli.Quantity = quantity;
        oli.UnitPrice = unitPrice;
        oli.PricebookEntryId=pbe;
        Database.insert(oli);
        return oli;
    }
        
    public static Product2 createProduct(String name, Decimal price){
         Product2 product = new product2();
         product.name=name;
         product.Price__c = price;
         product.productcode='PRD-342';
         Database.insert(product);
         return product;        
    }
        
    public static Account createAccount(String name) {
        Account account = new Account();
        account.name=name;
        account.accountnumber='12345';
        Database.insert(account);
        return account;
    }
    
}