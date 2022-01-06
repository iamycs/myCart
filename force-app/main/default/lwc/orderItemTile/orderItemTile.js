import { LightningElement, api } from 'lwc';

/**
Displays each orderitem
 */
export default class OrderItemTile extends LightningElement {
    @api orderItem;

    /** Fires event to delete the OrderItem */
    deleteOrderItem() {
        const event = new CustomEvent('orderitemdelete', {
            detail: { id: this.orderItem.Id }
        });
        this.dispatchEvent(event);
    }
}