import React from 'react';
import { SellerHero } from '../components/seller/SellerHero';
import { SellerBenefits } from '../components/seller/SellerBenefits';
import { SellerJourney } from '../components/seller/SellerJourney';
import { SellerTestimonials } from '../components/seller/SellerTestimonials';
import { SellerFAQ } from '../components/seller/SellerFAQ';
import { SellerSignupForm } from '../components/seller/SellerSignupForm';

export const BecomeSeller = () => {
  return (
    <div className="min-h-screen">
      <SellerHero />
      <SellerBenefits />
      <SellerJourney />
      <SellerTestimonials />
      <SellerFAQ />
      <SellerSignupForm />
    </div>
  );
};