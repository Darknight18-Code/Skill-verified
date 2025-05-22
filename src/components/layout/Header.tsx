import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, Menu, X, ChevronDown, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { skillCategories } from '../../data/skillCategories';
import { UserMenu } from './UserMenu';
import { useFreelancer } from '../../context/FreelancerContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showExploreDropdown, setShowExploreDropdown] = React.useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = React.useState(false);
  const location = useLocation();
  const { isFreelancer } = useFreelancer();

  // Gradient background to be applied initially
  const gradientBgStyle = {
    background: 'linear-gradient(90deg, rgba(76,68,208,1) 32%, rgba(132,68,208,1) 55%)', // Gradient from indigo to purple
  };

  const services = [
    {
      category: 'Templates',
      items: [
        { name: 'Website Templates', link: '/services/web-templates' },
        { name: 'Mobile App Templates', link: '/services/app-templates' },
        { name: 'UI Kits', link: '/services/ui-kits' }
      ]
    },
    {
      category: 'Digital Assets',
      items: [
        { name: 'Logo Templates', link: '/services/logos' },
        { name: 'Icon Sets', link: '/services/icons' },
        { name: 'Stock Photos', link: '/services/photos' }
      ]
    },
    {
      category: 'Code & Scripts',
      items: [
        { name: 'WordPress Plugins', link: '/services/wordpress' },
        { name: 'JavaScript Components', link: '/services/js-components' },
        { name: 'API Scripts', link: '/services/api-scripts' }
      ]
    }
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header background color logic for scroll state.
  const headerBgClass = isScrolled ? 'bg-white shadow-md' : ''; // Apply white background and shadow when scrolled

  const textColorClass = isScrolled ? 'text-gray-700' : 'text-white'; // Text color for scrolled state

  // Add logs for explore dropdown
  const handleExploreMouseEnter = () => {
    console.log('Explore dropdown opened');
    setShowExploreDropdown(true);
  };

  const handleExploreMouseLeave = () => {
    console.log('Explore dropdown closed');
    setShowExploreDropdown(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked in dropdown:', categoryId);
    console.log('Navigating to explore page with category:', categoryId);
  };

  return (
    <>
      <header
        className={`w-full z-50 fixed top-0 transition-all duration-300 ${headerBgClass}`}
        style={!isScrolled ? gradientBgStyle : {}} // Apply gradient initially and white on scroll
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo isScrolled={isScrolled} />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative">
                <button 
                  className={`flex items-center hover:text-indigo-600 transition-colors ${textColorClass}`}
                  onMouseEnter={handleExploreMouseEnter}
                  onMouseLeave={handleExploreMouseLeave}
                >
                  Explore
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                <AnimatePresence>
                  {showExploreDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2"
                      onMouseEnter={handleExploreMouseEnter}
                      onMouseLeave={handleExploreMouseLeave}
                    >
                      {skillCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/explore?category=${category.id}`}
                          className="flex items-center px-4 py-2 hover:bg-gray-50"
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <span className="text-xl mr-2">{category.icon}</span>
                          <span className="text-gray-700">{category.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button 
                  className={`flex items-center hover:text-indigo-600 transition-colors ${textColorClass}`}
                  onMouseEnter={() => setShowServicesDropdown(true)}
                  onMouseLeave={() => setShowServicesDropdown(false)}
                >
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Services
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                <AnimatePresence>
                  {showServicesDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2"
                      onMouseEnter={() => setShowServicesDropdown(true)}
                      onMouseLeave={() => setShowServicesDropdown(false)}
                    >
                      {services.map((category) => (
                        <div key={category.category} className="px-4 py-2">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">{category.category}</h3>
                          <div className="space-y-1">
                            {category.items.map((item) => (
                              <Link
                                key={item.name}
                                to={item.link}
                                className="block text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-2 py-1 rounded"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                          {category !== services[services.length - 1] && (
                            <div className="my-2 border-b border-gray-200" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                to="/skills" 
                className={`hover:text-indigo-600 transition-colors ${textColorClass}`}
              >
                Skill Assessment
              </Link>

              {!isFreelancer && (
                <Link 
                  to="/become-seller" 
                  className={`hover:text-indigo-600 transition-colors ${textColorClass}`}
                >
                  Become a Seller
                </Link>
              )}

              <button className={`flex items-center hover:text-indigo-600 transition-colors ${textColorClass}`}>
                <Globe className="h-4 w-4 mr-1" />
                English
              </button>

              <SignedIn>
                <UserMenu />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Join
                  </button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={textColorClass}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <div className="space-y-1">
                  <div className="font-medium px-3 py-2 text-gray-700">Categories</div>
                  {skillCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/explore?category=${category.id}`}
                      className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span className="text-xl mr-2">{category.icon}</span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="font-medium px-3 py-2 text-gray-700">Services</div>
                  {services.map((category) => (
                    <div key={category.category} className="px-3 py-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{category.category}</h3>
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.link}
                          className="block text-sm text-gray-600 hover:bg-gray-50 py-1 px-2 rounded"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>

                <Link
                  to="/skills"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50"
                >
                  Skill Assessment
                </Link>

                {!isFreelancer && (
                  <Link
                    to="/become-seller"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50"
                  >
                    Become a Seller
                  </Link>
                )}

                <button className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50">
                  <Globe className="h-4 w-4 mr-1" />
                  English
                </button>

                <SignedIn>
                  <UserMenu />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                      Join
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </motion.div>
          )}
        </nav>
      </header>
    </>
  );
};
