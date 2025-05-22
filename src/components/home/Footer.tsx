import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { skillCategories } from '../../data/skillCategories';
import { SignInRequiredModal } from '../auth/SignInRequiredModal';

const footerLinks = {
  about: [
    'About Us',
    'Careers',
    'Press & News',
    'Partnerships',
    'Privacy Policy',
  ],
  support: [
    'Help & Support',
    'Trust & Safety',
    'Selling on SkillCertified',
    'Buying on SkillCertified',
  ],
  resources: [
    'Skill Assessment',
    'Certification Process',
    'Success Stories',
    'Community Guidelines',
  ],
};

export const Footer = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      navigate(`/explore?category=${categoryId}`);
    } else {
      setPendingCategoryId(categoryId);
      setShowSignInModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSignInModal(false);
    if (isSignedIn && pendingCategoryId) {
      navigate(`/explore?category=${pendingCategoryId}`);
      setPendingCategoryId(null);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {skillCategories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/explore?category=${category.id}`}
                    onClick={e => handleCategoryClick(category.id, e)}
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
            {showSignInModal && <SignInRequiredModal onClose={handleModalClose} />}
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Link to="#" className="hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm">
              © 2024 SkillVerified. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-sm hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm hover:text-white transition-colors">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};