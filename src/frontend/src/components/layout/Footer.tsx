import { Heart } from 'lucide-react';
import { getAppIdentifier } from '../../utils/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appId = getAppIdentifier();

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} OLS - On-Line Selling. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
