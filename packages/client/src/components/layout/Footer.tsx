import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/50 bg-transparent px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 z-10 transition-all rounded-b-2xl md:rounded-none">
      <div className="text-sm text-muted-foreground">
        &copy; {currentYear} SellWise Inc. All rights reserved.
      </div>

      <div className="flex items-center gap-6">
        <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Help & Support
        </Link>
        <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          FAQ
        </Link>
        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Privacy
        </Link>
        <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Terms
        </Link>
      </div>
    </footer>
  );
}
