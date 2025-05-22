import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { Star } from 'lucide-react';
import { testimonials } from '../../data/testimonialData';

export const SellerTestimonials = () => {
  return (
    <section className="py-20 bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">
            Success Stories from Our Sellers
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={testimonial.name} delay={index * 0.1}>
              <motion.div
                className="bg-white rounded-lg p-6 shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                <div className="text-indigo-600 font-semibold">{testimonial.earnings}</div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};