import { LightningElement, api,wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';

import PRODUCT_SELECTED_MESSAGE from '@salesforce/messageChannel/ProductSelected__c';

/**
 * A presentation component to display a Product2 sObject. The provided
 * Product2 data must contain all fields used by this component.
 */
export default class ProductTile extends LightningElement {
    /** Whether the tile is draggable. */
    @api draggable;

    _product;
    
    

    /** Load context for Lightning Messaging Service */
    @wire(MessageContext) messageContext;
    
    /** Product2 to display. */
    @api
    get product() {
        return this._product;
    }

    set product(value) {
        this._product = value;
        this.id = value.Product2.Id;
        this.name = value.Name;
        this.price = value.Product2.Price__c;
        this.pricebookentryid = value.id;
    }


    /** Product2 field values to display. */
    pricebookentry;
    name;
    id;
    price;

    handleClick() {
        const selectedEvent = new CustomEvent('selected', {
            detail: this.product.Id
        });
        this.dispatchEvent(selectedEvent);
    }

    handleDragStart(event) {
        event.dataTransfer.setData('product', JSON.stringify(this.product));
    }

    handleAdd(event) {
        event.dataTransfer.setData('product', JSON.stringify(this.product));
    }

    handleAddProd(event) {
        // Published ProductSelected message
        publish(this.messageContext, PRODUCT_SELECTED_MESSAGE, {
            productId: JSON.stringify(this.product)
        });
    }
    

}