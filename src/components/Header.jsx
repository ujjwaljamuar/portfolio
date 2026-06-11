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

const portfolioBase = import.meta.env.BASE_URL || "/";

const NavContent = ({ setMenuOpen }) => {
    const closeMenu = () => setMenuOpen(false);

    return (
    <>
        <div>
            <a href={`${portfolioBase}#home`} onClick={closeMenu}>
                <img src={logo} alt={"logo"} />
            </a>
        </div>
        <div>
            <a onClick={closeMenu} href={`${portfolioBase}#home`}>
                Home
            </a>
            <a onClick={closeMenu} href={`${portfolioBase}#work`}>
                Work
            </a>
            <a onClick={closeMenu} href={`${portfolioBase}#timeline`}>
                Experience
            </a>
            <a onClick={closeMenu} href={`${portfolioBase}#services`}>
                Skills
            </a>
            <a onClick={closeMenu} href={`${portfolioBase}#testimonial`}>
                Testimonial
            </a>
            <a onClick={closeMenu} href={`${portfolioBase}#contact`}>
                Contact
            </a>
            <Link onClick={closeMenu} to="/blogs">
                Blogs
            </Link>
        </div>
        <a href="mailto:jamuarujjwal@gmail.com">
            <button>Email</button>
        </a>
    </>
    );
};

export default Header;
