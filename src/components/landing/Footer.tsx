
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer id="contact" className="py-8 border-t">
            <div className="container flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <p className="text-sm text-muted-foreground">&copy; 2025 ClickDown. All rights reserved.</p>
                </div>
                <nav className="flex gap-4">
                    <a href="#features" className="text-sm hover:underline">Features</a>
                    <a href="#pricing" className="text-sm hover:underline">Pricing</a>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;
