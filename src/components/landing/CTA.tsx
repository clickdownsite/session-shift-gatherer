
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTA = () => {
    return (
        <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold">
                    Ready to Streamline Your Data Collection?
                </h2>
                <p className="text-xl text-muted-foreground mt-4 mb-8">
                    Sign up today and start creating powerful data collection sessions in minutes.
                </p>
                <Button asChild>
                    <Link to="/auth">Get Started Now</Link>
                </Button>
            </div>
        </section>
    );
}

export default CTA;
