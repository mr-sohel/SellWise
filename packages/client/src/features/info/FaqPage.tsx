import React from 'react';

export function FaqPage() {
  const faqs = [
    {
      question: "How do I create a new product?",
      answer: "Navigate to the Products page from the sidebar and click the 'Add Product' button. You'll need to provide a name, price, and initial stock quantity."
    },
    {
      question: "Can I use SellWise on my mobile phone?",
      answer: "Yes, SellWise is fully responsive and can be accessed from any modern mobile browser."
    },
    {
      question: "How does demand forecasting work?",
      answer: "Our ML engine analyzes your past sales data (minimum 7 days) to predict future demand. We use Exponential Smoothing for short histories and Prophet for deeper historical data."
    },
    {
      question: "What happens if I run out of stock?",
      answer: "SellWise will alert you when stock levels fall below your configured threshold for that product. You will not be able to create new orders for out-of-stock items."
    },
    {
      question: "How do I add staff members?",
      answer: "Go to Settings > Staff Management. From there, you can invite team members and assign them roles such as Manager or Cashier."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-display-sm tracking-tight text-foreground">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about using SellWise.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl border border-border/50">
            <h3 className="text-lg font-medium text-foreground mb-2">{faq.question}</h3>
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
