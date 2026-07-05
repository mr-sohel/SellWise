import React from 'react';

export function PrivacyPage() {
  const lastUpdated = "July 5, 2026";

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="space-y-2 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-display-sm tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          At SellWise Inc. ("SellWise", "we", "us", or "our"), we respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you as to how we look after your personal data when you visit our website or use our
          SaaS application (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">1. The Data We Collect About You</h3>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address, billing address, and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes payment card details (processed securely via our payment providers).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products or services you have purchased from us.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this application.</li>
        </ul>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">2. How We Use Your Personal Data</h3>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing the SellWise service).</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">3. Data Security</h3>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
          In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-8 mb-4">4. Your Legal Rights</h3>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
          <li>Request restriction of processing your personal data.</li>
          <li>Request transfer of your personal data.</li>
          <li>Right to withdraw consent.</li>
        </ul>

        <p className="mt-8">
          If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:privacy@sellwise.com" className="text-primary hover:underline">privacy@sellwise.com</a>.
        </p>
      </div>
    </div>
  );
}
