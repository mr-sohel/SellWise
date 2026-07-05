import React from 'react';

export function TermsPage() {
  const lastUpdated = "July 5, 2026";

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="space-y-2 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-display-sm tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          Welcome to SellWise! These terms and conditions outline the rules and regulations for the use of SellWise's Website and Application, located at sellwise.com.
        </p>
        <p>
          By accessing this application we assume you accept these terms and conditions. Do not continue to use SellWise if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">1. License</h3>
        <p>
          Unless otherwise stated, SellWise and/or its licensors own the intellectual property rights for all material on SellWise. All intellectual property rights are reserved. You may access this from SellWise for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Republish material from SellWise</li>
          <li>Sell, rent or sub-license material from SellWise</li>
          <li>Reproduce, duplicate or copy material from SellWise</li>
          <li>Redistribute content from SellWise</li>
        </ul>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">2. User Accounts</h3>
        <p>
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>
        <p>
          You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">3. Fair Use & Acceptable Use Policy</h3>
        <p>
          You agree not to use the Service in any way that causes, or may cause, damage to the Service or impairment of the availability or accessibility of the Service; or in any way which is unlawful, illegal, fraudulent or harmful.
        </p>
        <p>
          Our machine learning and forecasting services are provided "as is". While we strive for accuracy, we do not guarantee the results of our demand forecasting models and are not liable for any business losses incurred due to reliance on these forecasts.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">4. Limitation of Liability</h3>
        <p>
          In no event shall SellWise, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your access to or use of or inability to access or use the Service;</li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>Unauthorized access, use or alteration of your transmissions or content.</li>
        </ul>

        <p className="mt-8">
          If you have any questions about these Terms, please contact us at <a href="mailto:legal@sellwise.com" className="text-primary hover:underline">legal@sellwise.com</a>.
        </p>
      </div>
    </div>
  );
}
