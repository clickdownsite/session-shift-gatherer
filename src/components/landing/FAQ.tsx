
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is ClickDown?",
        answer: "ClickDown is a platform that allows you to create dynamic session links to collect data from users in real-time. It's perfect for user research, feedback collection, live polls, and much more."
    },
    {
        question: "How do session links work?",
        answer: "You create a session, and ClickDown generates a unique link. You can share this link with your users. As they interact with the page (e.g., fill forms, click buttons), you see the data instantly in your dashboard."
    },
    {
        question: "Can I customize the pages my users see?",
        answer: "Yes! You have full control over the content and layout of the session pages. You can use our builder to add various elements like text, images, forms, and interactive components."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We take data security very seriously. All data is encrypted in transit and at rest, and we follow industry best practices to protect your information."
    },
    {
        question: "What kind of analytics do you provide?",
        answer: "We offer a range of analytics, from basic interaction counts to in-depth analysis of form submissions and user behavior patterns. The Pro plan unlocks more advanced analytics features."
    }
]

const FAQ = () => {
    return (
        <section id="faq" className="container py-24 sm:py-32 bg-muted/50 -mx-2 sm:-mx-8 md:-mx-16 lg:-mx-24 xl:-mx-32 2xl:-mx-40 px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-40">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold md:text-center mb-8">
                  Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>
                              {faq.answer}
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
