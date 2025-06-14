
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold animate-fade-in">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#6958E5] to-[#8A7DEB] text-transparent bg-clip-text">
              ClickDown
            </span>{" "}
            for instant data collection
          </h1>
        </main>
        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0 animate-fade-in [animation-delay:200ms]">
          Create and manage dynamic session links to gather data effortlessly. Track user interactions, collect form submissions, and gain insights in real-time.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4 animate-fade-in [animation-delay:400ms]">
          <Button className="w-full md:w-1/3" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>

      <div className="z-10 animate-fade-in [animation-delay:600ms]">
        <img
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2015"
          alt="Hero"
          className="w-full rounded-lg shadow-lg"
        />
      </div>

      <div className="hidden lg:block absolute h-full max-h-[800px] w-full max-w-[800px] bg-[radial-gradient(circle_500px_at_50%_200px,#6958E520,transparent)] -z-10" />

    </section>
  );
};

export default Hero;
