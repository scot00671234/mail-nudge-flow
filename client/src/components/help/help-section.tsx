import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function HelpSection() {
  const faqs = [
    {
      question: "How does Flow help me get paid faster?",
      answer: "Flow automatically sends friendly reminder emails to your customers when payments are due. You don't have to remember to follow up - it happens automatically based on the schedule you set."
    },
    {
      question: "What if I don't want to send a reminder to someone?",
      answer: "You have complete control! You can skip reminders for specific invoices, customize the message, or delay sending. Flow never sends anything without you being able to review it first."
    },
    {
      question: "Do I need to know anything technical to use Flow?",
      answer: "Not at all! Flow is designed for business owners, not technical people. Just upload your invoices (or type them in), and Flow handles the rest. It's as simple as sending an email."
    },
    {
      question: "Can I see what emails are being sent?",
      answer: "Yes! You can see every email before it goes out, edit the message if needed, and track when customers open and respond to your reminders."
    },
    {
      question: "How do I add my invoices?",
      answer: "There are two easy ways: 1) Upload files (PDF, Excel, Word documents) and Flow will read the details automatically, or 2) Fill out a simple form with the invoice information."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Quick Help</span>
          <Badge variant="secondary" className="text-xs">FAQ</Badge>
        </CardTitle>
        <CardDescription>
          Common questions about how Flow works
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}