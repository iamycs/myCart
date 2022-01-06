trigger OrderItemTrigger on OrderItem (before insert, before update) {
		
		/*************************************
		Trigger is used to assign pricebook to order on first product addition.
		Also utilized to set the Order Type
		
		*************************************/

		List <Order> orderList = new List <order> ();
		List<Pricebook2> pricebook = [Select id from Pricebook2 where IsStandard = true] ;
		if(pricebook.size()>0){
			Set<id> orderIds = new Set<id>() ;
			for(OrderItem item : Trigger.new){
				orderIds.add(item.OrderId) ;
			}

			for (Order order: [Select Id,pricebook2id from Order where Id in :orderIds]) {
				if(order.Pricebook2Id == null ){
					order.Pricebook2Id = pricebook[0].Id;
					order.Type ='Sales';
					orderList.add(order);
				}
			}
			if(orderList.size() > 0){
				update orderList;
			}
		}
}