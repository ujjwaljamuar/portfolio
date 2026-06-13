import { AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";
import logo from "../assets/briefcase.png";

const Header = ({ setMenuOpen, menuOpen }) => {
    return (
        <>
            <nav>
                <NavContent setMenuOpen={setMenuOpen} />
            </nav>

            <button className="navBtn" onClick={() => setMenuOpen(!menuOpen)}>
                <AiOutlineMenu />
            </button>
        </>
    );
};

export const HeaderPhone = ({ menuOpen, setMenuOpen }) => {
    return (
        <div className={`navPhone ${menuOpen ? "navPhoneComes" : ""}`}>
            <NavContent setMenuOpen={setMenuOpen} />
        </div>
    );
};

const NavContent = ({ setMenuOpen }) => {
    const closeMenu = () => setMenuOpen(false);

    return (
    <>
        <div>
            <Link to="/#home" onClick={closeMenu}>
                <img src={logo} alt={"logo"} />
            </Link>
        </div>
        <div>
            <Link onClick={closeMenu} to="/#home">
                Home
            </Link>
            <Link onClick={closeMenu} to="/#work">
                Work
            </Link>
            <Link onClick={closeMenu} to="/#timeline">
                Experience
            </Link>
            <Link onClick={closeMenu} to="/#services">
                Skills
            </Link>
            <Link onClick={closeMenu} to="/#contact">
                Contact
            </Link>
            <Link onClick={closeMenu} to="/blogs">
                Blogs
            </Link>
        </div>
        <a href="mailto:ujjwaljamuar@outlook.com">
            <button>Email</button>
        </a>
    </>
    );
};

export default Header;
