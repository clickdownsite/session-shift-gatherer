
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const pricingTiers = [
    {
        name: "Free",
        price: "$0",
        frequency: "/month",
        description: "For individuals and small teams getting started.",
        features: [
            "10 Session Links",
            "Basic Analytics",
            "Community Support",
        ],
        cta: "Get Started",
        link: "/auth"
    },
    {
        name: "Pro",
        price: "$29",
        frequency: "/month",
        description: "For growing businesses that need more power and support.",
        features: [
            "Unlimited Session Links",
            "Advanced Analytics",
            "Email & Phone Support",
            "Team Collaboration",
        ],
        cta: "Try for Free",
        link: "/auth",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Contact Us",
        frequency: "",
        description: "For large organizations with custom needs.",
        features: [
            "Everything in Pro",
            "Custom Integrations",
            "Dedicated Account Manager",
            "SLA and 24/7 Support",
        ],
        cta: "Contact Sales",
        link: "#contact"
    }
];

const Pricing = () => {
    return (
        <section id="pricing" className="container py-24 sm:py-32">
            <h2 className="text-3xl lg:text-4xl font-bold md:text-center mb-2">
                Pricing
            </h2>
            <p className="text-xl text-muted-foreground md:text-center mb-8">
                Choose the plan that's right for you.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricingTiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {tier.name}
                                {tier.popular && <span className="bg-primary text-primary-foreground text-sm font-semibold px-2 py-1 rounded-full">Most Popular</span>}
                            </CardTitle>
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold">{tier.price}</span>
                                {tier.frequency && <span className="text-muted-foreground ml-1">{tier.frequency}</span>}
                            </div>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {tier.features.map(feature => (
                                    <li key={feature} className="flex items-center">
                                        <Check className="h-5 w-5 text-primary mr-2" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link to={tier.link}>{tier.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default Pricing;
