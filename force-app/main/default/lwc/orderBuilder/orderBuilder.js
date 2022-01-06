import { LightningElement, wire, api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_SELECTED_MESSAGE from '@salesforce/messageChannel/ProductSelected__c';


 
/** Record DML operations. */
import {
    createRecord,
    updateRecord,
    deleteRecord,
} from 'lightning/uiRecordApi';

/** Use Apex to fetch related records. */
import { refreshApex, getSObjectValue } from '@salesforce/apex';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';
import getOrderInfo from '@salesforce/apex/OrderController.getOrderInfo';
import confirmOrder from '@salesforce/apex/OrderController.confirmOrder';


/** OrderItem Schema. */
import ORDER_ITEM_OBJECT from '@salesforce/schema/OrderItem';
import ORDER_FIELD from '@salesforce/schema/OrderItem.OrderId';
import PRODUCT_FIELD from '@salesforce/schema/OrderItem.Product2Id';
import PRICEBOOKENTRY from '@salesforce/schema/OrderItem.PricebookEntryId';
import QTY from '@salesforce/schema/OrderItem.Quantity';
import Id from '@salesforce/schema/OrderItem.Id';
import PRICE_FIELD from '@salesforce/schema/OrderItem.UnitPrice';
   

/**
 * Gets the quantity of all items in an OrderItem SObject.
 */
function getQuantity(orderItem) {
    return (
        getSObjectValue(orderItem, QTY)
    );
}

/**
 * Gets the price for the specified quantity of OrderItem SObject.
 */
function getPrice(orderItem, quantity) {
    return getSObjectValue(orderItem, PRICE_FIELD) * quantity;
}

/**
 * Calculates the quantity and price of all OrderItem SObjects.
 */
function calculateOrderSummary(orderItems) {
    const summary = orderItems.reduce(
        (acc, orderItem) => {
            const quantity = getQuantity(orderItem);
            const price = getPrice(orderItem, quantity);
            acc.quantity += quantity;
            acc.price += price;
            return acc;
        },
        { quantity: 0, price: 0 }
    );
    return summary;
}

/**
 * Builds Order by CRUD'ing the related OrderItem SObjects.
 */
export default class OrderBuilder extends LightningElement {
    /** Id of Order SObject to display. */
    @api recordId;

    /** The OrderItem SObjects to display. */
    orderItems;

    /**  Order Status to decide editable or readonly   **/
    @track orderStatus;
    @track status;
    wiredOrderStatus;
    
    /** Total price of the Order. Calculated from this.orderItems. */
    orderPrice = 0;

    /** Total quantity of the Order. Calculated from this.orderItems. */
    orderQuantity = 0;

    error;

    /** Wired Apex result so it may be programmatically refreshed. */
    wiredOrderItems;


    

/** Load context for Lightning Messaging Service */
@wire(MessageContext) messageContext;

connectedCallback() {
    // Subscribe to ProductSelected message
    this.productSelectionSubscription = subscribe(
        this.messageContext,
        PRODUCT_SELECTED_MESSAGE,
        (message) => this.handleProductSelected(message.productId)
    );
}

handleProductSelected(productId) {
    if(!this.orderStatus){
    const product = JSON.parse(productId);

    // build new OrderItem record
    const fields = {};
    fields[ORDER_FIELD.fieldApiName] = this.recordId;
    fields[PRODUCT_FIELD.fieldApiName] = product.Product2Id;
    fields[PRICE_FIELD.fieldApiName] = product.Product2.Price__c;
    fields[PRICEBOOKENTRY.fieldApiName] = product.Id;
    fields[QTY.fieldApiName] = '1';
    var item = this.orderItems.filter(e => e.Product2Id === product.Product2Id);
    if(this.orderItems.filter(e => e.Product2Id === product.Product2Id).length>0){
        const fieldsUpdate = {};
        fieldsUpdate[Id.fieldApiName] = item[0].Id ;
        fieldsUpdate[QTY.fieldApiName] =item[0].Quantity+1;
        const recordInput = { fields: fieldsUpdate };
        updateRecord(recordInput)
            .then(() => {
                 return refreshApex(this.wiredOrderItems);
            })
            .catch((e) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating order item',
                        message: reduceErrors(e).join(', '),
                        variant: 'error'
                    })
                );
            });
    }
    
   else{
    

    // create OrderItem record on server
    const recordInput = {
        apiName: ORDER_ITEM_OBJECT.objectApiName,
        fields
    };
    createRecord(recordInput)
        .then(() => {
            // refresh the OrderItem SObjects
            return refreshApex(this.wiredOrderItems);
        })
        .catch((e) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating order',
                    message: reduceErrors(e).join(', '),
                    variant: 'error'
                })
            );
        });

    }
}
        else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Message',
                    message: 'Activated Orders can not be modified',
                    variant: 'error'
                })
            );

        }
}

    /** Apex load the Order's OrderItems[] */
    @wire(getOrderItems, { orderId: '$recordId' })
    
    wiredGetOrderItems(value) {
        this.wiredOrderItems = value;
        if (value.error) {
            this.error = value.error;
        } else if (value.data) {
            this.setOrderItems(value.data);
        }
    }
    @wire(getOrderInfo, { orderId: '$recordId' })
    wiredGetOrderInfo(val) {
        this.wiredOrderStatus = val;
        this.status=val.data;
        if (val.error) {
            this.error = val.error;
        } 
        else if (val.data =="Activated") {
            this.orderStatus = true;    
        }
        else {this.orderStatus = false;}
    }


    /** Updates the order items, recalculating the order quantity and price. */

     
    setOrderItems(orderItems) {
        this.orderItems = orderItems.slice();
        const summary = calculateOrderSummary(this.orderItems);
        this.orderQuantity = summary.quantity;
        this.orderPrice = summary.price;
    }

    /** Confirm Order to External System **/
    submitOrder(){
       confirmOrder({orderId: this.recordId})
       .then((statusCode) => {
        if(statusCode == '200'){
            this.orderStatus = true;
            this.status='Activated';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Order Confirmed',
                    message: 'Order Confirmed and Activated Successfully!',
                    variant: 'success'
                })
            );

         }
        else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Status Code :'+statusCode,
                    message: 'Order Confirmation failed!',
                    variant: 'error'
                })
            );
        }
        return refreshApex(this.wiredOrderItems);
    }
    )
    .catch((error) => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while processing the request',
                message: error.body.message,
                variant: 'error'
            })
        );

    
    });
    
}
    /** Handles event to delete OrderItem. */
    handleOrderItemDelete(evt) {

        if(!this.orderStatus){
        const id = evt.detail.id;
        // optimistically make the change on the client
        const previousOrderItems = this.orderItems;
        const orderItems = this.orderItems.filter(
            (orderItem) => orderItem.Id !== id
        );
        this.setOrderItems(orderItems);

        // delete OrderItem SObject on the server
        deleteRecord(id)
            .then(() => {
                // if there were triggers/etc that invalidate the Apex result for refresh
                 return refreshApex(this.wiredOrderItems);
            })
            .catch((e) => {
                // error updating server so rollback to previous data
                this.setOrderItems(previousOrderItems);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting order item',
                        message: reduceErrors(e).join(', '),
                        variant: 'error'
                    })
                );
            });
        }
        else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Message',
                    message: 'Activated Orders can not be modified',
                    variant: 'error'
                })
            );

        }
    }
}