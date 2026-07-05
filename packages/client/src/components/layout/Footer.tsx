import { Link } from 'react-router-dom';
import { Package2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-sm px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 z-10 transition-all rounded-b-2xl md:rounded-none">
      
      {/* Branding & Copyright */}
      <div className="flex flex-col gap-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Package2 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SellWise
          </span>
        </Link>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Intelligent Retail Management.<br/>
          Empowering your business with AI-driven insights and demand forecasting.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} SellWise Inc. All rights reserved.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-12 sm:gap-16">
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
        </div>
        
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-foreground">Resources</h4>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">API Documentation</Link>
          <span className="text-sm text-muted-foreground/50 cursor-default">System Status</span>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          <span className="text-xs text-muted-foreground/50 mt-1 cursor-default">v1.0.0</span>
        </div>
      </div>
      
    </footer>
  );
}
