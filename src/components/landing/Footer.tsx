import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink-800 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-lg font-bold text-paper-100">Ledger</span>
            <p className="mt-2 text-sm text-paper-500 max-w-xs">
              Trade journal &amp; performans defteri. İşlemlerini kaydet,
              performansını analiz et, toplulukla rekabet et.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-paper-500 mb-4">
              Ürün
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() =>
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-paper-300 hover:text-mint-400 transition"
                >
                  Özellikler
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-paper-300 hover:text-mint-400 transition"
                >
                  Yorumlar
                </button>
              </li>
              <li>
                <Link href="/register" className="text-sm text-paper-300 hover:text-mint-400 transition">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-paper-500 mb-4">
              Şirket
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-paper-300">Hakkında</span>
              </li>
              <li>
                <span className="text-sm text-paper-300">İletişim</span>
              </li>
              <li>
                <span className="text-sm text-paper-300">Gizlilik</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-800/50 text-center">
          <p className="text-xs text-paper-500 font-mono">
            &copy; 2025 Ledger. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
