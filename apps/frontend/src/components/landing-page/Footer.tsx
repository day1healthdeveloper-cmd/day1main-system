export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Day1Health</h3>
            <p className="text-slate-400 text-sm">
              Simple, fast, affordable medical insurance for every South African.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>0800 DAY ONE</li>
              <li>info@day1health.co.za</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Compliance</h4>
            <p className="text-xs text-slate-400">
              Day1Health (Pty) Ltd is an authorised Financial Services Provider (FSP 11319).
              This is a Medical Insurance Product demarcated by CMS (Ref: DM1053A).
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>© 2025 Day1Health. All rights reserved. POPIA compliant.</p>
        </div>
      </div>
    </footer>
  );
}
