
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "John Doe",
    title: "Marketing Manager",
    quote: "ClickDown has revolutionized how we collect feedback. It's fast, intuitive, and the real-time analytics are a game-changer for our team.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    name: "Jane Smith",
    title: "Product Lead",
    quote: "We've been able to iterate on our product so much faster thanks to the instant insights from ClickDown sessions. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/women/75.jpg"
  },
  {
    name: "Sam Wilson",
    title: "UX Researcher",
    quote: "The ability to create dynamic session links on the fly is incredible. It saves us hours of setup time for each user testing session.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        What Our{" "}
        <span className="inline bg-gradient-to-r from-[#6958E5] to-[#8A7DEB] text-transparent bg-clip-text">
          Customers
        </span>
        {" "} Say
      </h2>
      <p className="text-xl text-muted-foreground md:text-center mt-4 mb-8">
        Hear from teams who have transformed their data collection process.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="bg-muted/50 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
            <CardContent className="pt-6">
              <p className="italic">"{testimonial.quote}"</p>
              <div className="flex items-center mt-4">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
