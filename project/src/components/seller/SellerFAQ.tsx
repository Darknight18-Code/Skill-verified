import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { Plus, Minus } from 'lucide-react';
import { faqData } from '../../data/faqData';

export const SellerFAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
        </FadeIn>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 0.1}>
              <motion.div
                className="border border-gray-200 rounded-lg overflow-hidden"
                initial={false}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-indigo-600" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openIndex === index ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <p className="p-4 bg-gray-50 text-gray-600">{faq.answer}</p>
                </motion.div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};