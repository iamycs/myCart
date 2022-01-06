public with sharing class ProductController {

    static Integer PAGE_SIZE = 9;
    @AuraEnabled(Cacheable=true)
    public static PagedResult getProducts( Id OrderId, Integer pageNumber) {
        String whereClause = '';
        if(OrderId != null){
         Order o = [Select id,Pricebook2Id  from order where id =:OrderId];
         List<PricebookEntry> pricebookentries = [select id, name,Product2.Id, product2.Price__c from PricebookEntry where Pricebook2Id = :o.Pricebook2Id];
         whereClause = 'WHERE Pricebook2Id =\''  +o.Pricebook2Id + '\' ';
        }
        Integer pageSize = ProductController.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM PricebookEntry ' + whereClause
        );
        result.records = Database.query(
            'SELECT Id, Name, Product2.Id, product2.Price__c, product2.Description FROM PricebookEntry ' +
            whereClause +
            ' WITH SECURITY_ENFORCED' +
            ' ORDER BY Name LIMIT :pageSize OFFSET :offset'
        );
        return result;
    }
}