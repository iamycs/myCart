import { LightningElement, api, wire } from 'lwc';

// Lightning Message Service and message channels
import { publish, subscribe, MessageContext } from 'lightning/messageService';
//import PRODUCTS_FILTERED_MESSAGE from '@salesforce/messageChannel/ProductsFiltered__c';
import PRODUCT_SELECTED_MESSAGE from '@salesforce/messageChannel/ProductSelected__c';

// getProducts() method in ProductController Apex class
import getProducts from '@salesforce/apex/ProductController.getProducts';

/**
 * Container component that loads and displays a list of Product records.
 */
export default class ProductTileList extends LightningElement {

    @api recordId;
    /** Current page in the product list. */
    pageNumber = 1;

    /** The number of items on a page. */
    pageSize;

    /** The total number of items matching the selection. */
    totalItemCount = 0;

    /** Load context for Lightning Messaging Service */
    @wire(MessageContext) messageContext;


    /**
     * Load the list of available products.
     */
    @wire(getProducts, { orderId:'$recordId',  pageNumber: '$pageNumber' })
    products;


    handleProductSelected(event) {
        // Published ProductSelected message
        publish(this.messageContext, PRODUCT_SELECTED_MESSAGE, {
            productId: event.detail
        });
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }
}