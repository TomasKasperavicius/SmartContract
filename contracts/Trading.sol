// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Trading{
    
    uint public productCount = 5;
    mapping (uint => Product[]) public products;
    uint[] public inStock;
    address payable public seller;
    address payable public buyer;
    
    struct Product{
        uint productID;
        string name;
        uint price;
        address payable owner;
        bool sold;
    }

    struct Order{
        uint orderID;
        Product orderedProduct;
        uint quantity;
        uint shipmentPrice;
        address payable buyer;
        address payable courier;
        bool paid;
        bool delivered;
        bool canceled;
        uint paidAmount;
        uint date;
    }

    mapping (uint => Order) public orders;
    uint public orderCount = 0;

    constructor(address _buyer){
        for (uint i = 1; i <=productCount ; i++) {
            inStock.push(5);
        }
        
        for (uint i = 1; i <= 5; i++) { 
            products[1].push(Product(1,"Refrigerator",1000000000000000000,payable(msg.sender),false));
            products[2].push(Product(2,"Stove",2000000000000000000,payable(msg.sender),false));
            products[3].push(Product(3,"Dishwasher",3000000000000000000,payable(msg.sender),false));
            products[4].push(Product(4,"Microwave",4000000000000000000,payable(msg.sender),false));
            products[5].push(Product(5,"Laundry washer",5000000000000000000,payable(msg.sender),false));
        }
        
        
        seller = payable(msg.sender);
        buyer = payable(_buyer);
    }

    event OrderPaid(
        Order order,
        uint date
    );
    event OrderCreated(
        uint orderID,
        Product orderedProduct,
        uint quantity,
        uint shipmentPrice,
        address payable buyer,
        address payable courier,
        bool paid,
        bool delivered,
        bool canceled,
        uint paidAmount,
        uint date
    );
    event OrderDelivered(
        Order order,
        uint delivery_date
    );
    modifier onlyBuyer() {
        require(msg.sender == buyer);
        _;
    }
    
    
    function orderProduct(uint _productID, uint _quantity) public payable onlyBuyer{
        require(_productID > 0 && _productID <= productCount);
        require(_quantity>0&&_quantity <= inStock[_productID-1]);
        orderCount++;
        orders[orderCount] = Order(orderCount,products[_productID][1],_quantity,1000000000000000000,payable(msg.sender),payable(address(0)),false,false,false,0,block.timestamp);
        emit OrderCreated(orderCount,products[_productID][1],_quantity,1000000000000000000,payable(msg.sender),payable(address(0)),false,false,false,0,block.timestamp);
    }
    modifier onlySeller() {
        require(msg.sender == seller);
        _;
    }
    function getTotal(uint _orderID) view public onlyBuyer returns(uint total){
        require(_orderID > 0 && _orderID <= orderCount);
        require(msg.sender == orders[_orderID].buyer);
        return (orders[_orderID].shipmentPrice+orders[_orderID].orderedProduct.price*orders[_orderID].quantity);
    }

    function assignCourier(uint _orderID,address _courier) public payable onlySeller{
        require(_orderID > 0 && _orderID <= orderCount);
        Order memory _order= orders[_orderID];
        require(_order.paid&&!_order.canceled);
        require(!_order.delivered);
        require(_courier != address(0));
        _order.courier = payable(_courier);
        orders[_orderID] = _order;
    }
    
    function payOrder(uint _orderID)  public payable onlyBuyer{
        require(_orderID > 0 && _orderID <= orderCount);
        Order memory _order = orders[_orderID];
        require(!_order.paid&&!_order.canceled);
        require(msg.value == _order.shipmentPrice+(_order.orderedProduct.price*_order.quantity));
        _order.paid = true;
        _order.paidAmount = msg.value;
        orders[_orderID] = _order;
        for (uint i = 1; i <= orderCount; i++) {
            if (orders[i].date - 360 >= block.timestamp) {
                orders[i].canceled = true;
                orders[i].buyer.transfer(getTotal(orders[i].orderID));
            }
        }
        emit OrderPaid(orders[_orderID],block.timestamp);
    }
    
    function deliverOrder(uint _orderID) public payable{
        require(_orderID > 0 && _orderID <= orderCount);
        Order memory _order = orders[_orderID];
        require(msg.sender == _order.courier);
        require(_order.paid&&!_order.canceled&&!_order.delivered);
        inStock[_order.orderedProduct.productID-1] -= _order.quantity;
        uint quantity= _order.quantity;

        for (uint i = 1; i <= inStock[_order.orderedProduct.productID-1]&&quantity>0; i++) {
            if(!products[_order.orderedProduct.productID][i].sold)
            {
            products[_order.orderedProduct.productID][i].sold = true;
            products[_order.orderedProduct.productID][i].owner = payable(_order.buyer);
            quantity--;
            }
        }

        payable(seller).transfer(_order.paidAmount-_order.shipmentPrice);


        payable(_order.courier).transfer(_order.shipmentPrice);
        _order.delivered = true;
        orders[_orderID] = _order;
        emit OrderDelivered(_order,block.timestamp);
    }
}
