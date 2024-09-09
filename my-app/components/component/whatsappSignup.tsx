import React, { useState } from 'react';

const WhatsAppSignup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // Here you would typically send the phone number to your backend
    console.log('Phone number submitted:', phoneNumber);
    // Reset the input field
    setPhoneNumber('');
  };

  return (
    <section className="bg-blue-100 py-12 mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Stay Updated</h2>
        <p className="text-xl text-gray-700 mb-6">
          Would you like to be the first to know about our updates and promotions? Join our WhatsApp group!
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300">
            Join Group
          </button>
        </form>
      </div>
    </section>
  );
};

export default WhatsAppSignup;