@IsTest
    private class ProductControllerTest{
        @IsTest
        static void testBehavior() {
        
        Integer pageNumber = 1;
        Pricebook2 pb = TestDataFactory.createPriceBook('Test2 Pricebook'); 
        Product2 product = TestDataFactory.createProduct('I Phone 12',12.5);
        Account acct =  TestDataFactory.createAccount('Test Account');    
        PricebookEntry pbe1 = TestDataFactory.createPricebookEntry(10,Test.getStandardPricebookId(),product.Id,true);
        PricebookEntry pbe2 = TestDataFactory.createPricebookEntry(20,pb.Id,product.Id,true);
        Order o = TestDataFactory.createOrder('Test Order',pb.Id,acct.Id,system.today(),'Draft');

        Test.startTest();
        System.assertNotEquals(null, ProductController.getProducts(o.Id,pageNumber));
        Test.stopTest();
        }
    }