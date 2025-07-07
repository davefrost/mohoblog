import { Link } from "wouter";
import { Mountain, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Mountain className="h-8 w-8 mr-3" />
              <span className="text-xl font-bold">Adventures on Wheels</span>
            </div>
            <p className="text-gray-300">
              Following our journey across the country, sharing adventures one mile at a time.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/?category=adventures" className="text-gray-300 hover:text-white transition-colors">
                  Adventures
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=adventures" className="text-gray-300 hover:text-white transition-colors">
                  Motorhome Adventures
                </Link>
              </li>
              <li>
                <Link href="/?category=mechanical" className="text-gray-300 hover:text-white transition-colors">
                  Mechanical Issues
                </Link>
              </li>
              <li>
                <Link href="/?category=dog" className="text-gray-300 hover:text-white transition-colors">
                  The Dog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; 2024 Adventures on Wheels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
