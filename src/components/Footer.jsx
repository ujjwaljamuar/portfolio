import React from "react";
import {
    AiFillGithub,
    AiFillInstagram,
    AiFillLinkedin,
    AiOutlineArrowUp,
} from "react-icons/ai";

const Footer = () => {
    return (
        <footer>
            <div>
                <img
                    // src={"https://avatars.githubusercontent.com/ujjwaljamuar"}
                    // src={"https://github.com/ujjwaljamuar/Files/assets/56722405/fd9dfb1b-237a-4091-afa8-a255ecbb7426"}
                    src={"https://github.com/ujjwaljamuar.png"}
                    alt="Founder"
                />

                <h2>Ujjwal Jamuar</h2>
                <p>Motivation is temporary, but discipline last forever.</p>
            </div>

            <aside>
                <h2>Social Media</h2>

                <article>
                    <a
                        href="https://linkedin.com/in/ujjwal-jamuar"
                        target={"blank"}
                    >
                        <AiFillLinkedin />
                    </a>
                    <a
                        href="https://instagram.com/loneee_wolff_"
                        target={"blank"}
                    >
                        <AiFillInstagram />
                    </a>
                    <a href="https://github.com/ujjwaljamuar" target={"blank"}>
                        <AiFillGithub />
                    </a>
                </article>
            </aside>
            <a href="#home">
                <AiOutlineArrowUp />
            </a>
        </footer>
    );
};

export default Footer;
