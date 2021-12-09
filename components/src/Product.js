import { useState } from "react";
import './Product.css'

function Product(props) {
    const [added, setadded] = useState(0)
    
    async function buy(){
        setadded(0)
        try {
            await props.contract.methods.orderProduct(props.id+1,added).send({from:props.account})
            let orderID = await props.contract.methods.orderCount().call({from:props.account})
            let total = await props.contract.methods.getTotal(orderID).call({from:props.account})
            await props.contract.methods.payOrder(orderID).send({from:props.account, value: total})
        } catch (error) {
            console.log(error)
            return;
        }
        
    }

    return (  
        <div className="product-container">
            <div className="data-container">
                <div>

                Amount left: {props.inStock[props.id]}
                </div>
                <div>
                Product name: {props.data.name}

                </div>
                <div>

                Price:{' '}{window.web3.utils.fromWei(props.data.price,'Ether')}{' '}ETH
                </div>
            </div>
            <div className="img-container">
            <img src={props.image} alt="Prekės nuotrauka"/>

            </div>
            <div className="added">
                Selected {added}
            </div>
            <div className="btn-container">
            <button className="btn1" onClick={()=>setadded(added+1)}>+</button>
            <button className="btn2" onClick={()=>setadded(added-1 >= 0 ? added-1 : added)}>-</button>

            </div>
            <div className="buyBtn">
            <button className="btn3" onClick={buy}>Purchase</button>
            </div>
        </div>
    );
}

export default Product;