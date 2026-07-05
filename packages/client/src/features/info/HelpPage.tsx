import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react';

export function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-display-sm tracking-tight text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">We're here to help you get the most out of SellWise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border/50 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-medium text-foreground mb-1">Live Chat</h3>
            <p className="text-muted-foreground text-sm mb-4">Chat with our support team in real-time during business hours (9AM - 6PM, Sun-Thu).</p>
          </div>
          <button className="mt-auto px-4 py-2 bg-foreground text-primary-foreground rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors">
            Start Chat
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center text-violet">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="text-xl font-medium text-foreground mb-1">Email Support</h3>
            <p className="text-muted-foreground text-sm mb-4">Send us an email anytime. We typically respond within 24 hours.</p>
          </div>
          <a href="mailto:support@sellwise.com" className="mt-auto px-4 py-2 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors border border-border/50">
            support@sellwise.com
          </a>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-border/50 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-primary" size={24} />
          <h2 className="text-2xl font-medium text-foreground">Documentation & Resources</h2>
        </div>

        <ul className="space-y-4">
          <li>
            <Link to="/faq" className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors group">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Frequently Asked Questions</h4>
                <p className="text-sm text-muted-foreground">Quick answers to common questions</p>
              </div>
              <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors group">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">API Documentation</h4>
                <p className="text-sm text-muted-foreground">Integrate SellWise with your custom applications</p>
              </div>
              <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
