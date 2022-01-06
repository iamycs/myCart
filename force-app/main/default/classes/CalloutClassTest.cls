@isTest
private class CalloutClassTest {
     @isTest static void testCallout() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        // Call method to test.
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
        
               
        Pricebook2 pb = TestDataFactory.createPriceBook('Test2 Pricebook'); 
        Product2 product = TestDataFactory.createProduct('I Phone 12',12.5);

        Account acct =  TestDataFactory.createAccount('Test Account');    
        
        PricebookEntry pbe1 = TestDataFactory.createPricebookEntry(10,Test.getStandardPricebookId(),product.Id,true);
        PricebookEntry pbe2 = TestDataFactory.createPricebookEntry(20,pb.Id,product.Id,true);
         
        Order o = TestDataFactory.createOrder('Test Order',pb.Id,acct.Id,system.today(),'Draft');
        OrderItem oi = TestDataFactory.createOrderItem(o.Id,4,12.6,pbe2.Id);

      Test.startTest();
      String res = OrderController.confirmOrder(o.Id);
      Test.stopTest();
      
      //Verify response received contains fake values
      System.assertEquals('200',res);
      Order ordr = [Select id, status from order Limit 1];
       System.assertEquals('Activated',ordr.Status);
    }
}