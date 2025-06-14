
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, BarChart, Link as LinkIcon } from 'lucide-react';

const features = [
    {
        icon: <LinkIcon className="w-6 h-6" />,
        title: "Dynamic Session Links",
        description: "Generate unique links for each data collection session, ensuring data integrity and easy tracking."
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Real-time Data Capture",
        description: "Monitor user interactions and form submissions as they happen with our live data dashboard."
    },
    {
        icon: <BarChart className="w-6 h-6" />,
        title: "In-depth Analytics",
        description: "Analyze collected data with powerful tools to gain valuable insights and make informed decisions."
    }
];

const Features = () => {
    return (
        <section id="features" className="container py-24 sm:py-32 space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
                Key {" "}
                <span className="inline bg-gradient-to-r from-[#6958E5] to-[#8A7DEB] text-transparent bg-clip-text">
                    Features
                </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(({ icon, title, description }) => (
                    <Card key={title} className="bg-muted/50 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                                {icon}
                            </div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription className="mt-2">{description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default Features;
