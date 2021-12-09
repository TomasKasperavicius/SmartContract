import './Navbar.css'
function Navbar(props) {
    return (
        <div className="my-navbar" >Logged in as: {props.account}</div>
    );
}

export default Navbar;