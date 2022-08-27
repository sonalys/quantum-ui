interface props {
  className ?: string
}

const Navbar = ({className} : props) => <div className={`navbar ${className}`}/>

export default Navbar;