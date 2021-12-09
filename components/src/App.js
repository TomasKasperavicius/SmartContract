import React,{ useEffect,useState } from 'react'
import Web3 from 'web3'
import Trading from './abis/Trading.json'
import Navbar from './Navbar'
import Product from './Product'
import './App.css'
import LaundryWasher from './images/LaundryWasher.jpg'
import Stove from './images/Stove.png'
import Microwave from './images/Microwave.jpg'
import Dishwasher from './images/Dishwasher.jpg'
import Refrigerator from './images/Refrigerator.jpg'

function App() {
  const [account, setAccount] = useState(0)
  const [contract, setContract] = useState(null)
  const [data, setData] = useState([])
  const [images, setImages] = useState([])
  const [amount, setAmount] = useState([])
  useEffect(()=>{
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          try {
              // Request account access if needed
              await window.ethereum.request({method: 'eth_requestAccounts'})
          } catch (error) {
            console.log(error)
              // User denied account access...
          }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
          
      }
      // Non-dapp browsers...
      else {
          alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    })
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", loadBlockchainData)
    }
    setImages([Refrigerator,Stove, Dishwasher, Microwave, LaundryWasher])
  },[])
  
  async function loadBlockchainData(){
    const accounts = await window.web3.eth.getAccounts()
    setAccount(accounts[0])
    const networkID = await window.web3.eth.net.getId()
    const networkData = Trading.networks[networkID]
    if (networkData) {
      const trading = new window.web3.eth.Contract(Trading.abi,networkData.address)
      setContract(trading)
      const productcount = await trading.methods.productCount().call()
      var productsAmounts = [] 
      var Data = []
      for (let i = 1; i <= productcount; i++) {
        const product = await trading.methods.products(i,0).call()
        const productAmount = await trading.methods.inStock(i-1).call()
        productsAmounts = [...productsAmounts,productAmount]
        Data = [...Data,product]
      }
      setData(Data)
      setAmount(productsAmounts)
    } else {
      alert('Trading contract not deployed to network you are using!')
    }

  }
  async function assignCourier(){
    try {
      let courier = "0xab4eA5fC2b9D6645aEd30Ea64815629CFeE268a8"
      let seller = await contract.methods.seller().call({from:account})
      let orderID = await contract.methods.orderCount().call({from:account})
      await contract.methods.assignCourier(orderID,courier).send({from: seller})
    } catch (error) {
        console.log(error)
    return;
    }
    
  }
  async function deliverOrder(){
    try {
      let courier = "0xab4eA5fC2b9D6645aEd30Ea64815629CFeE268a8"
      let orderID = await contract.methods.orderCount().call({from:account})
      await contract.methods.deliverOrder(orderID).send({from:courier})
    } catch (error) {
        console.log(error)
    return;
    }
    var productsAmounts = [] 
    const productcount = await contract.methods.productCount().call()
    for (let i = 1; i <= productcount; i++) {
      const productAmount = await contract.methods.inStock(i-1).call()
      productsAmounts = [...productsAmounts,productAmount]
    }
    setAmount(productsAmounts)
  }
  return (
    <React.Fragment>
      <div className="app-container">
      <Navbar  account={account}/> 
      <button className="loadBtn" onClick={loadBlockchainData}>Connect account</button>
      <div className="products-container">
      {data.map((product,key)=>{
        return (<Product key={key} account={account} contract={contract} data={product} image={images[key]} id ={key} inStock={amount} />)
      })}
      </div>
      <div className="button-container">
      <button className="assignCourierBtn" onClick={assignCourier}>Assign courier</button>
      <button className="deliverOrderBtn" onClick={deliverOrder}>Deliver order</button>
      </div>
      </div>
    </React.Fragment>
  )
}


export default App
